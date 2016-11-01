#!/usr/bin/perl

use JSON;
use Exporter qw(import);
use Data::Dumper;
our @EXPORT_OK = qw(createCTF);

my $game_dir    = "/tmp/game/";

sub createCTF {
    my $game = shift;
    my $game_id = $game->{'id'};

    $game->{'wps'}  = &dummyGame();
    $game->{'type'} = "CTF";

    my $my_game_dir = $game_dir."/".$game_id;

    print STDERR Dumper ($game);

    if (! -e $my_game_dir."/game" ) {
	mkdir $my_game_dir || return "Cannot create game dir";
	open (GAME, " > $my_game_dir/game") || return "Cannot create game $my_game_dir/game";
	print GAME JSON->new->encode( $game );
	close (GAME);
	return 'ok';
	
    }
    else {
	return "Game already exists";
    }
}


sub dummyGame {
    my %dummy_volme_game = (
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
    );
    print STDERR (\%dummy_volme_game);

    return \%dummy_volme_game;
}

1;
