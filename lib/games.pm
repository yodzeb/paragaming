#!/usr/bin/perl

package games;

use strict;
use JSON;
use CGI;
use CGI::Session;
use Exporter qw(import);

BEGIN {push @INC, '/var/www/ctf/lib/'};
use ctf;

our @EXPORT = qw(getOthers updatePosition getGameInfo registerUser);

my $game_dir    = "/tmp/game/";

sub registerUser {
    my $data     = shift;
    my $session  = shift;

    my $game_id  = $data->{'gid'};

    $session->param("nickname") = $data->{'nick'};
    $session->param("team")     = $data->{'team'};
}

sub updatePosition {
    my $data    = shift;
    my $session = shift;

    my $lat = $data->{'c'}->{'lat'};
    my $lon = $data->{'c'}->{'lon'};
    my $alt = $data->{'c'}->{'alt'};
    my $time = time();

    my %positions;
    if (defined($session->param("positions"))){
	%positions = %{$session->param("positions")};
    }
    $positions{$time} = { "lat" => $lat, "lon"=>$lon, "alt" => $alt };
    $session->param("positions", \%positions);
    $session->param("LAST_UPDATE", time());

    # Update the game
    my $game = &readGame ( $data->{'gid'} );
    if ($game->{'type'} =~ /CTF/) {
	&ctf::updateCTF( $data, $session );
    }
    # elsif ...

    return "ok";
}

sub readGame {
    my $game_id = shift;
    my $my_game_dir = $game_dir."/".$game_id."/game";
    my $res = "";

    if (-e $my_game_dir) {
	open (GAME, "< $my_game_dir");
	while (<GAME>) {
	    $res.=$_;
	}
    }
    print STDERR "game:$my_game_dir  ".$res;
    return JSON->new->decode ( $res );
}

sub getOthers {
    my $game_id = shift;
    my $sid = shift;

    my $session_dir = $game_dir."/".$game_id."/";

    my @files = glob( $session_dir . '/cgisess_*' );
    #print STDERR $session_dir."\n";
    my %others;

    my $time = time()+10;

    my $max_time = 600;
    my @to_clean;

    foreach my $cur_filename (@files) {
	#print STDERR $cur_filename."\n";
	my $cur_sid     = $1 if $cur_filename =~  /cgisess_(.*)/;
	next if ($cur_sid =~  /$sid/);

	my $cur_session = new CGI::Session(undef, $cur_sid, {Directory=>$session_dir});
	my $other_pos   = $cur_session->param('positions');
	next unless (defined($other_pos));


	my $a_time = $cur_session->param('LAST_UPDATE');
	if (!defined($a_time)) {
	    $a_time = time();
	    $cur_session->param("LAST_UPDATE", time());
	}

	if ( ($time - $a_time) > $max_time ) {
	    push (@to_clean, $cur_sid);
	}
	else {
	    #print STDERR Dumper ($other_pos);
	    my $last_pos_id = (sort { $b <=> $a} keys($other_pos))[0];
	    print STDERR "sending".$last_pos_id;
	    my $pos = $other_pos->{$last_pos_id};
	    next if ($pos->{"alt"}==3);
	    $others{$cur_sid} = $pos;
	    #print STDERR "last: $cur_sid : " . $last_pos_id."\n";
	}
    }

    foreach (@to_clean) {
	my $cmd="rm -f ".$game_dir."/".$game_id."/cgisess_".$_;
	` $cmd `;
    }

    return \%others;
}


sub getGameInfo {
    my $game_id = shift;

    my $res = &readGame ($game_id);

    return  (JSON->new->encode($res));    
}


1;
