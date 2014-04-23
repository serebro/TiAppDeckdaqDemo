var sounds = {
	'showMyAlbum open': 'Open_Album',
	'showMyAlbum close': 'Open_Album',
	'albumOpened showCard': 'Big_Card_Select',
	'bigCard selectCut': 'Big_Card_Select_Cut',
	'inventory swishPack': 'Card_or_Deck_Swish',
	'inventory fabricToWood': 'Card_from_my_inventory_to_wood',
	'inventory woodToFabric': 'Card_from_my_wood_to_my_inventory',
	'inventory cardMove': 'Card_or_Deck_Swish',
	'inventory explodePack': 'Card_split_to_Card_on_Wood_Area',
	'inventory slideFromAlbum': 'Transition_from_Wood_Area_To_Blue_my_inventory_Area',
	'view-card hide': 'Exit_Big_Card',
	'toggleGlass open': 'Glass_Window_Open_to_left',
	'toggleGlass close': 'Glass_Window_Close_to_right',
	'toggleDrawer down': 'Scroll_From_Glass_Window_(incl._Click5_-_Metal_within)',
	'toggleDrawer up': 'Scroll_To_Glass_Window_(incl._Click5_-_Metal_within)',
	'metalButton click': 'Click_5_-_Metal',
	'woodButton click': 'Click4_-_on_wood',
	'general click': 'Click1_-_General',
	'inventory fabric': 'Click6_-_Fabric',
	'buttonPress click': 'Click2_-_Button_Press',
	'submit click': 'Buy',
	'myAlbumsList showAlbum': 'Click3_-_choose_album_on_my_albums',
	'area close': 'Close_Area',
	'sideArea close': 'Close_Area_From_Side',
	'screen popup': 'Screen_Pop_Up',
	'screen popdown': 'Screen_Pop_Down',
	'screen fly': 'Screen_Fly_Left_and_Come_Back_from_other_Side',
	'albumOpened addCardToAlbum': 'Put_Card_into_Album_(from_glass)',
	'inventoryPackDecks showOpenDeck': 'Pick_This_Deck',
	'storeBuyDecks pick': 'Pick_This_Deck',
	'albumOpened onHoverCard': 'Mouse_over_Card_or_Select_Card_from_Glass_Window',
	'albumOpened offHoverCard': 'Mouse_move_from_Card',
	'lobby openMarket': 'Open_Market_Area',
	'store showAlbums': 'From_Buy_Decks_to_Buy_Album',
	'store showDecks': 'From_Buy_Album_to_Buy_Decks',
	'inventory cardDown': 'Card_Down_-_on_my_inventory',
	'inventory cardUp': 'Card_Up_-_on_my_inventory',
	'inventory moveFromSide': 'My_inventory_move_from_side',
	'lobbyCoins change': 'Buy',
	'openArea open': 'Open_Area',
	'move swish': 'Swish_move_on_ACT_FAST_in_the_market',
	'arcade mouseOver': 'spin_machine_spin3',
	'arcade showGame': 'spin_machine_start_moving',
	'album move-open': 'Album_Move_Open',
	'album move-close': 'Album_Move_Close',
	'arcade buy-ticket-click': 'buy1_-_click',
	'arcade ticket-to-machine': 'card_enter_machine',
	'arcade ticket-to-slot': 'card_get_out',
	'guess-game init': 'where_is_the_prize',
	'guess-game cycle': '1_2_3_shine',
	'guess-game here': 'here_-_click',
	'arcade ticket-remove': 'card_dissapear',
	'guess-game you-win': 'you_win',
	'guess-game you-lose1': 'you_loose_opt1',
	'guess-game you-lose2': 'you_loose_opt2',
	'guess-game curtain-down': 'curtain_down',
	'guess-game all-curtains-up': 'all_curtains_close',
	'spin-game alive': 'spin_machine_alive',
	'spin-game start-moving': 'spin_machine_start_moving',
	'spin-game spin-click': 'spin_-_click',
	'spin-game light-on': 'spin_machine_spin3',
	'spin-game you-lose': 'spin_machine_-_you_loose1',
	'spin-game you-lose-tops': 'spin_machine_-_you_loose2',
	'spin-game you-win': 'spin_machine_-_you_win_',
	'spin-game you-win-tops': 'spin_machine_-_you_win2_',
	'spin-game tops-close': 'spin_machine_-_tops_close',
	'spin-game tops-up': 'spin_machine_tops_go_up_-_also_when_you_loose',
	'spin machine': 'spin_machine_spin1',
	'sonar 1': 'sonar',
	'system new-notice': '1_2_3_shine',
	'system new-request': 'spin_machine_start_moving',
	'system level-up': 'spin_machine_-_you_win_',
	'system new-unlock': 'you_win',
	'lobby-friends mouse-over': 'Click3_-_choose_album_on_my_albums',
	'game buzzer': 'game_show_buzzer_07',
	'game bell': 'game_show_bell_06',
	'wood clatter': 'Break_Wood_Large_Clatter',
	'wood break': 'Wood_Break_Big_Thump_Sub'
};

var frequently = ['general click', 'openArea open'];
var _cache = {};

var createSound = function(name, is_preload){
	var format = 'mp3';
	name = sounds[name];
	if (!_cache[name]) {
		_cache[name] = sound = Ti.Media.createSound({
			url: Ti.Filesystem.resourcesDirectory + '/sounds/' + format + '/' + name + '.' + format,
			preload: !!is_preload
		});
	}

	return _cache[name];
};

//// preload frequently used sounds
for(var i in frequently) {
	if (frequently.hasOwnProperty(i)) {
		_cache[frequently[i]] = createSound(frequently[i], true);
	}
}

module.exports = function(App){
	return function(name) {
		if (!App.user.get('is_sound')) {
			return null;
		}

		try {
			var sound = createSound(name);
			sound.stop();
			sound.play();
		} catch(e) {
			App.console.warn('No sound found: ' + name, e);
		}
		return sound;
	};
};
