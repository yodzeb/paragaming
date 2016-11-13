#!/usr/bin/perl

package games;

use strict;
use JSON;
use CGI;
use CGI::Session;
use Exporter qw(import);
use Data::Dumper;

BEGIN {push @INC, '/var/www/ctf/lib/'};
use ctf;

our @EXPORT = qw(getOthers updatePosition getGameInfo registerUser listGames updateGame);

my $game_dir    = "/tmp/game/";
my $max_time = 600;

sub updateGame {
    my $game = shift;
    my $game_id = $game->{'id'};
    my $my_game_dir = $game_dir."/".$game_id;

    open (GAME, " > $my_game_dir/game") || return "Cannot create game $my_game_dir/game";
    print GAME JSON->new->encode( $game );
    close (GAME);
}

sub listGames {
    my @games =  glob( $game_dir . '/*/game' );
    
    my @res;

    foreach (@games) {
	if ($_ =~ /$game_dir\/([^\/]+)\/game/) {
	    push @res, &readGame($1);
	}
    }
    return \@res;		       
}

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
	&ctf::updateCTF( $data, $session, $positions{$time} );
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
    return JSON->new->decode ( $res );
}

sub getOthers {
    my $game_id = shift;
    my $sid     = shift;
    my $session_dir = $game_dir."/".$game_id."/";
    my @files       = glob( $session_dir . '/cgisess_*' );
    my $my_session  = new CGI::Session(undef, $sid, {Directory=>$session_dir}) ;;
    my $my_pos      = &getLastPosition($my_session->param("positions"));
    my $time        = time()+10;
    my %others;
    my @to_clean;
    my $geo = new Geo::Distance;

    foreach my $cur_filename (@files) {
	my $cur_sid     = $1 if $cur_filename =~  /cgisess_(.*)/;
	my $cur_session = new CGI::Session(undef, $cur_sid, {Directory=>$session_dir});
	my $other_pos   = $cur_session->param('positions');


	if  (!(ref($other_pos) eq 'HASH') || $cur_sid =~  /$sid/) {
	    next;
	}

	my $a_time = $cur_session->param('LAST_UPDATE');
	print STDERR "$a_time\n";
	if (!defined($a_time)) {
	    print STDERR "updating";
	    $a_time = time();
	    $cur_session->param("LAST_UPDATE", time());
	}

	if ( ($time - $a_time) > $max_time ) {
	    push (@to_clean, $cur_sid);
	}
	else {
	    $others{$cur_sid} = &getLastPosition($other_pos);
	    $others{$cur_sid}->{'distance'} = int($geo->distance( 'meter', $my_pos->{'lon'},$my_pos->{'lat'}=>$others{$cur_sid}->{'lon'},$others{$cur_sid}->{'lat'}));
	}
    }

    foreach (@to_clean) {
	my $cmd="rm -f ".$game_dir."/".$game_id."/cgisess_".$_;
	` $cmd `;
    }

    return \%others;
}


sub getLastPosition {
    my $positions = shift;
    my $last_pos_id = (sort { $b <=> $a} keys($positions))[0];
    return ( $positions->{$last_pos_id} );
}

sub getGameInfo {
    my $game_id = shift;

    my $res = &readGame ($game_id);

    return  (JSON->new->encode($res));    
}


1;
