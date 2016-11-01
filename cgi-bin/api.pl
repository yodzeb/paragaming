#!/usr/bin/perl

use strict;
use CGI;
use CGI::Session;
use warnings;
use Data::Dumper;
use JSON;

BEGIN {push @INC, '/var/www/ctf/lib/'};

use ctf;
use games;

sub verif {
    my $param = shift;
    exit unless ($param =~ /^[\w]+$/);
}

my $q = CGI->new;
my $response;

my $game_dir    = "/tmp/game";
my $session_dir = $game_dir;#"/tmp/sessions";
my $session;

if ($q->request_method eq "POST") {
    print STDERR "bla: ".Dumper ($q->param('POSTDATA'));
    my $data    = decode_json($q->param('POSTDATA'));
    my $command = $data->{'cmd'};
    my $game_id = $data->{'gid'};
    $game_id = "nogid" if (!defined($game_id) || $game_id !~ /\w/);

    &verif($game_id);

    $session_dir .= "/".$game_id."/";
    
    my $sid         = $q->cookie("CTFSID") || undef;
    if (! -d $session_dir )  {
	mkdir $session_dir;
    }

    $session     = new CGI::Session(undef, $sid, {Directory=>$session_dir});


    # if ($command =~ /createGame/) {
    # 	my $gameid = $data{'gameid'};
	
    # }
    # els
    if ($command =~ /up/) {
	$response = &updatePosition ( $data, $session );
    }
    
    elsif ($command =~ /others/) {
	my $others = &getOthers($game_id, $sid);
	$response = JSON->new->encode( $others );
	print STDERR "response : ". $response."\n";
    }

    elsif ($command =~ /create/) {
	my $game = $data->{'game'};
	my $game_type = $game->{'type'};
	my $game_id   = $game->{'id'};
	
	&createCTF ( $game );
    }
    
}
else {
    
    $response = "Nothing to do";
}


my $cookie = $q->cookie(CTFSID => $session->id);

print $q->header( -type => 'text/plain',
		  -cookie => $cookie);
print $response;
