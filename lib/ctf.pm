#!/usr/bin/perl

use JSON;
use Exporter qw(import);
 
our @EXPORT_OK = qw(createCTF);

my $game_dir    = "/tmp/games/";

sub createCTF {
    my $game = shift;
    my $game_id = $game->{'id'};

    $game->{'wps'} = &dummyGame();

    my $my_game_dir = $game_dir."/".$game_id;
    if (! -e $my_game_dir ) {
	mkdir $my_game_dir;
	open (GAME, " > ".$my_game_dir."/game");
	print GAME JSON->new->encode( $game );
	close (GAME);
    }
}


sub getGame {
    my $game_id = shift;

    my $my_game_dir = $game_dir."/".$game_id."/game/";

    my $res = "";

    if (-e $my_game_dir) {
	open (GAME, "< $my_game_dir");
	while (<GAME>) {
	    $res.=$_;
	}
    }
    return JSON->new->decode ($res);    
}

sub dummyGame {
    my %dummy_volme_game = {
	"antenna" => { 
	    "lat"    => 49.463602, 
	    "lon"    => 6.097872,
	    "radius" => 100,
	    "owner"   => { 
		"ID"  => -1 ,
		"alt" => 0 
	    }
	},
	"deco"    => {
	    "lat" => 49.445219, 
	    "lon" => 6.100619,
	    "radius" => 100,
	    "owner" => { 
		"ID"  => -1 ,
		"alt" => 0 
	    }
	},
	"a31" => {
	    "lat" => 49.450014,
	    "lon" => 6.12022,
	    "radius" => 200,
	    "owner" => {
		"ID"  => -1 ,
		"alt" => 0
	    }
	}
    };
    return \%dummy_volme_game;
}
