#!/usr/bin/perl

package ctf;

#use GPS::Point ;
use Geo::Distance;
use JSON;
use Exporter qw(import);
use Data::Dumper;

BEGIN {push @INC, '/var/www/ctf/lib/'; };
use games;

our @EXPORT = qw(createCTF updateCTF);

my $game_dir    = "/tmp/game/";

sub updateCTF {
    my $data    = shift;
    my $session = shift;
    my $last_pos = shift; # lazzy
    
    my $game = &games::readGame ($data->{'gid'}) ;
    my $update = 0;
    foreach my $wp ( keys (%{$game->{'wps'}})) {

	my $geo = new Geo::Distance;
	my $lat1= $last_pos->{'lat'};
	my $lon1= $last_pos->{'lon'};
	my $lon2 = $game->{'wps'}->{$wp}->{'lon'};
	my $lat2 = $game->{'wps'}->{$wp}->{'lat'};
	
	my $distance = $geo->distance( 'meter', $lon1,$lat1=>$lon2,$lat2);
	print STDERR "Distance: $distance\n";

	if ( exists ($game->{'wps'}->{$wp}->{'taken_time'})  && (time() - $game->{'wps'}->{$wp}->{'taken_time'}) > 60) {
	    print STDERR "reinit taken $wps\n";
	    $game->{'wps'}->{$wp}->{'taken'} = 0;
	    $update = 1;
	}

	if ($distance < $game->{'wps'}->{$wp}->{'radius'}) {
	    print STDERR "got the flag $wp \n";
	    $game->{'wps'}->{$wp}->{'taken'} = 1;
	    $game->{'wps'}->{$wp}->{'taken_alt'} = $last_pos->{'alt'};
	    $game->{'wps'}->{$wp}->{'taken_time'} = time();
	    $update = 1;
	}	
    }

    &games::updateGame ($game ) if ($update);
}

sub createCTF {
    my $game = shift;
    my $game_id = $game->{'id'};

    $game->{'wps'}  = &dummyGame();
    $game->{'type'} = "CTF";

    my $my_game_dir = $game_dir."/".$game_id;

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
