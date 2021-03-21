function init_marker_cluster(){
	// init marker_cluster to map
	if( marker_cluster != null ){
		map.removeLayer(marker_cluster);
	}
	marker_cluster = L.markerClusterGroup({
		showCoverageOnHover: true,
		zoomToBoundsOnClick: true,
		spiderfyOnMaxZoom: true,
		removeOutsideVisibleBounds: true,
	});
	map.addLayer(marker_cluster);

	// init all_markers_by_date
	all_markers_by_date = {};
	for( data of current_light_data.response_data ){
		let date_part = data.date.split(" ")[0];
		if( !(date_part in all_markers_by_date) ){
			all_markers_by_date[date_part] = [];
		}
		all_markers_by_date[date_part].push( create_marker(data) );
	}
	// console.log(all_markers_by_date);

	/*
	for( key in all_markers_by_date ){
		for( marker of all_markers_by_date[key] ){
			all_markers_by_leafletid[ marker._leaflet_id ] = marker;
			// all_markers_by_leafletid[ marker["_leaflet_id"] ] = marker;
		}
	}
	console.log(all_markers_by_leafletid);
	*/
}

function pad(num, size) {
    var s = num+"";
    while (s.length < size) s = "0" + s;
    return s;
}

function refresh_marker(start_date,end_date){
	end_date = new Date(end_date);
	let current_date = new Date(start_date);

	marker_cluster.clearLayers();
	while(current_date.getTime()<=end_date.getTime()){
		let year = current_date.getFullYear();
		let month = pad(current_date.getMonth()+1,2);
		let date = pad(current_date.getDate(),2);
		let current_date_str = year+"-"+month+"-"+date;

		// console.log(current_date_str);
		// console.log( current_date_str in all_markers_by_date );
		// console.log(all_markers_by_date);

		if( current_date_str in all_markers_by_date ){
			for( marker of all_markers_by_date[current_date_str] ){
				marker_cluster.addLayer(marker);
			}
		}
		current_date.setDate(current_date.getDate() + 1);
	}

	// for( key in all_markers_by_date ){
	// 	for( marker of all_markers_by_date[key] ){
	// 		marker_cluster.addLayer(marker);
	// 	}
	// }
	marker_cluster.refreshClusters();
	// console.log(all_markers_by_date);
}

function create_marker(data){
	let marker = L.marker(new L.LatLng(data.latitude,data.longitude));
	// marker._icon.id = data.id;
	// marker.bindPopup(title);
	// marker.bindTooltip(data.title).openTooltip();
	marker.bindTooltip(data.title);

	marker.on('click', function (e) {
        // console.log('hi');
        openModal(data.id);
    });
	// marker.on('mouseover', function (e) {
 //        $(this).addClass('animated slideInDown');
 //    });
    // marker.on('mouseout', function (e) {
    //     this.closePopup();
    // });
	// $(marker).addClass('animated slideInDown');
	// L.DomUtil.addClass(marker._icon, 'animated');
	// L.DomUtil.addClass(marker._icon, 'slideInDown');
	// L.DomUtil.removeClass(marker._icon, 'className');

	return marker;
}
