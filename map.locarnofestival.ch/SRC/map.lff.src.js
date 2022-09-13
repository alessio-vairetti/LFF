
	var pitchchanging=true;
	var zoomThreshold = 16.5;
	var zoomStart = 15.5;
	var pitchto = 55;
	var pitchfrom = 20;
	var mapdisab=false
	var openedmenu=-1;
	var openlat="46.1662169959036";
	var openlng="8.7923381075233";
	var lang="en";
	var theaters_flag="Theaters";
	var locations_flag="Other Locations";
	var button_flag="Discover more";
	var directions_flag="Get directions";
	var langpattern=/l=it/;

initMap=function() {
	
if(langpattern.test(window.location.href)) {
				lang="it";
				theaters_flag="Sale";
				locations_flag="Altre location";
				button_flag="Scopri di più";
				directions_flag="Ottieni indicazioni";
			}	
	
if ($(window).width()<821) {
	pitchfrom=10;
	pitchto=30;
	zoomThreshold=16;
	zoomStart = 15.2;
	openlat="46.16893647528967";
	openlng="8.795653317766366";
}


$.ajax({
  url: '../data/locations_'+lang+'.json',
  dataType: 'json',
  type: 'GET',
  success: function(data) {
	 
	locs=data.locations.length;
	
		for (x=0;x<locs;x++) {
			gID=x;
			gTitle=data.locations[x].title;
			gSubtitle=data.locations[x].subtitle;
			gLat=data.locations[x].latitude;
			gLng=data.locations[x].longitude;
			gAddr=data.locations[x].address
			gUrl=data.locations[x].linkurl
			gImg=data.locations[x].picture
			
			if(typeof gSubtitle !== "undefined") gSubtitle=gSubtitle.replace(/. Accessibility:/,".<br/><br/>Accessibility:")
				
			if (x==0) {
				$('<div class="card"><div class="card-header card-header-black sec-active theathers-menu"><h5 class="mb-0"><button class="btn btn-link" type="button" onclick="javascript:showTheaters()">'+theaters_flag+'</button></h5></div></div><div class="theaters-inner"></div>').appendTo($('#accordionMenu'));
			}
			
			if (x<10) {
			$('<span class="texts" title="'+gTitle+'" data-href="'+gAddr+'" data-link="'+gUrl+'" data-image="'+gImg+'" id="txt-'+gID+'">'+gSubtitle+'</span>').appendTo($('body'));
				$('<div class="card theaters"><div class="card-header" id="a-'+gID+'"><h5 class="mb-0"><button class="btn btn-link" type="button" data-toggle="collapse" data-target="#collapse-'+gID+'" aria-expanded="false" aria-controls="collapse-'+gID+'" onclick="javascript:moveMap('+gLat+', '+gLng+', '+gID+')">'+gTitle+'</button></h5></div><div id="collapse-'+gID+'" class="collapse" aria-labelledby="a-'+gID+'" data-parent="#accordionMenu"><div class="card-body"></div></div></div>').appendTo($('.theaters-inner'));
			}
			
			if (x==9) {
				$('<div class="card"><div class="card-header card-header-black others-menu"><h5 class="mb-0"><button class="btn btn-link" type="button" onclick="javascript:showOtherLocations()">'+locations_flag+'</button></h5></div></div><div class="locations-inner"></div>').appendTo($('#accordionMenu'));
			}
			
			if (x>9 && x<22) {
						$('<span class="texts" title="'+gTitle+'" data-href="'+gAddr+'" data-link="'+gUrl+'" data-image="'+gImg+'" id="txt-'+gID+'">'+gSubtitle+'</span>').appendTo($('body'));
						$('<div class="card other-locations"><div class="card-header" id="a-'+gID+'"><h5 class="mb-0"><button class="btn btn-link" type="button" data-toggle="collapse" data-target="#collapse-'+gID+'" aria-expanded="false" aria-controls="collapse-'+gID+'" onclick="javascript:moveMap('+gLat+', '+gLng+', '+gID+')">'+gTitle+'</button></h5></div><div id="collapse-'+gID+'" class="collapse" aria-labelledby="a-'+gID+'" data-parent="#accordionMenu"><div class="card-body"></div></div></div>').appendTo($('.locations-inner'));
			}
		}
	}})


	$('.hamburger').on('click', function() {
			$('.card').removeClass('active');
			$(this).toggleClass('is-active')
			$('#accordionMenu').toggleClass('is-opened')
			$('.mobile-desc').removeClass('d-inline')
			return;
		});
		
	if (!mapdisab) {
		mapBoxLoad();
	}

}

mapBoxLoad=function() {


mapboxgl.accessToken = 'pk.eyJ1IjoiZnVyZ2kiLCJhIjoiY2wxbm10OHFzMHZ4aTNla3EyZWdsYmY0eCJ9.O2qIBQLtY26c2O16TZacTA'; 


    const map = new mapboxgl.Map({
      container: 'map',
      
      style: 'mapbox://styles/furgi/cl1nmyep2003314lz7l7tvyek', 
	  center: [8.745500712530264,46.168178223924684],
      zoom: 13,
	  minZoom: 10,
	  pitch: pitchfrom, 
	  bearing: 0 
    });

	rotate=function() {
        map.easeTo({ center: [openlng,openlat], bearing: -44, duration: 3000, zoom: zoomStart });
		pitchchanging=true
	}


map.on('load', () => {
rotate();


				map.setPaintProperty(
				  '3D-extrusions', 
				  'fill-extrusion-color', 
				  ['match', ['get', 'LFFtype'], 'Theater',  '#ffdd00', '#e2e2e2']
				);


				map.addSource('festivallocations', {
				'type': 'vector',
				'data': 'mapbox://furgi.cl1ozoljm0bow27qp7c2n8y4y-6ikd2'
				});


				//SETUP MAP CLICK BEHAVIOUR
				map.on('click', (e) => {
				const features = map.queryRenderedFeatures(e.point);
				 

				const displayProperties = [
				'type',
				'properties',
				'id',
				'layer',
				'sourceLayer'
				];
				 
				const displayFeatures = features.map((feat) => {
				const displayFeat = {};
				displayProperties.forEach((prop) => {
				displayFeat[prop] = feat[prop];
				});
				return displayFeat;
				});


				let getPlace=displayFeatures[0];
				if(typeof getPlace !== "undefined")
				{
				  layerCheck=getPlace.layer;
				  if (layerCheck.id=='3D-extrusions') {
			 
				  clickedid=getPlace.properties.LFFid
				  spanObj=$('#txt-'+clickedid);
				 
				  if (clickedid<10 && clickedid!=openedmenu) {
					  showTheaters()
					  let getMenuLink=$('#a-'+clickedid)
					  if (getMenuLink.length>0) getMenuLink.find('button').addClass('mobile-clicked').trigger('click')
				  }
				  
				if (clickedid>=10 && clickedid!=openedmenu) {

					showOtherLocations()
					let getMenuLink=$('#a-'+clickedid)
					if (getMenuLink.length>0) getMenuLink.find('button').addClass('mobile-clicked').trigger('click')
					openedmenu=clickedid;

				  }
				  }
				} 
				});


				//SETUP MAP MOUSEMOVE BEHAVIOUR
				map.on('mousemove', (e) => {
				const featuresmove = map.queryRenderedFeatures(e.point);
				 

				const displayProperties = [
				'type',
				'properties',
				'id',
				'layer',
				'sourceLayer'
				];
				 
				const displayFeaturesmove = featuresmove.map((feat) => {
				const displayFeat = {};
				displayProperties.forEach((prop) => {
				displayFeat[prop] = feat[prop];
				});
				return displayFeat;
				});


				let getPlaceMove=displayFeaturesmove[0];

					if(typeof getPlaceMove !== "undefined")
					{
					  layerCheck=getPlaceMove.layer;
					  if (layerCheck.id=='3D-extrusions') {
					  map.getCanvas().style.cursor = 'pointer';
					  } else {
					  map.getCanvas().style.cursor = '';
					  }
					} 
				});

				$('img.in').on('click',function() {
					gZ=map.getZoom()+0.5;
					map.easeTo({ duration: 900, zoom: gZ});
				})

				$('img.out').on('click',function() {
					gZ=map.getZoom()-0.5;
					map.easeTo({ duration: 900, zoom: gZ});
				})





				moveMap=function(lat,lon,ref) {

					$('.mapboxgl-popup').remove()
					let mobileClicked=false
					if ($('#a-'+ref).find('button').hasClass('mobile-clicked')) mobileClicked=true
					$('#a-'+ref).find('button').removeClass('mobile-clicked')

					if (ref==openedmenu && !mobileClicked) {
						$('#accordionMenu').toggleClass('is-opened')
						$('.hamburger').toggleClass('is-active')
					}

					if (ref==openedmenu) {

							gtMapLatlng=lat+','+lon;
							aObj=$('#a-'+ref);
							popTitle=spanObj.attr('title');
							popAddress=spanObj.attr('data-href');
							popLink=spanObj.attr('data-link');
							popImage=spanObj.attr('data-image');
						  
							popDesc=spanObj.html();
							
							let setInfoTxt="";
							
							  if (popImage!='undefined') { setInfoTxt='<a class="mimg" style="background-image:url(../images/'+popImage+')"></a>'; }
							  if (popDesc!='undefined') { setInfoTxt+="<p>"+popDesc+"</p>"; }
							  
							  
							  if (popLink!='undefined') {
								setInfoTxt=setInfoTxt+'<a href="'+popLink+'" class="ext-url" target="_blank">'+button_flag+'</a>';
							  }
							  
							  if (popAddress!='undefined') {
								setInfoTxt=setInfoTxt+'<a href="https://www.google.com/maps/dir/?api=1&destination='+encodeURIComponent(popAddress)+'" target="_blank"><img class="dir" src="../images/directions_square.svg" alt="'+directions_flag+'" title="'+directions_flag+'" /></a>';
							  }
							  
							  
							  $('.mobile-desc').html('<h5>'+popTitle+'</h5>'+setInfoTxt).addClass('d-inline');
					}

					if (ref!=openedmenu) {

					openedmenu=ref


					if (!mobileClicked) {
					$('#accordionMenu').toggleClass('is-opened')
					$('.hamburger').toggleClass('is-active')
					}
					$('.mobile-desc').removeClass('d-inline')



					disab=false;
					if (!disab) {
							$('div.marker-pin').remove()
							let el = document.createElement('div');
							el.className = 'marker-pin';
							el.style.backgroundImage = `url(../images/LFF-pin.svg)`;
							el.style.width = `18px`;
							el.style.height = `18px`;
							el.style.backgroundSize = '100%';
							 
							new mapboxgl.Marker(el)
							.setLngLat([lon,lat])
							.addTo(map);

							map.off('zoom', () => { });

						map.easeTo({ center: [lon,lat], duration: 1200, zoom: zoomThreshold, pitch: pitchto, offset: [0,-90]});
						
					}
					spanObj=$('#txt-'+ref);


					gtMapLatlng=lat+','+lon;
					aObj=$('#a-'+ref);
					  popTitle=spanObj.attr('title');
					  popAddress=spanObj.attr('data-href');
					  popLink=spanObj.attr('data-link');
					  popImage=spanObj.attr('data-image');
					  
					  popDesc=spanObj.html();
					
					  $('.card').removeClass('active');
					  let setInfoTxt="";
					  
					  
					  if (popImage!='undefined') { setInfoTxt='<a class="mimg" style="background-image:url(../images/'+popImage+')"></a>'; }
					  
					  if (popDesc!='undefined') { setInfoTxt+="<p>"+popDesc+"</p>"; }
					  
					  
					  if (popLink!='undefined') {
					  setInfoTxt=setInfoTxt+'<a href="'+popLink+'" class="ext-url" target="_blank">'+button_flag+'</a>';
					  }
					  
					  if (popAddress!='undefined') {
					  setInfoTxt=setInfoTxt+'<a href="https://www.google.com/maps/dir/?api=1&destination='+encodeURIComponent(popAddress)+'" target="_blank"><img class="dir" src="../images/directions_square.svg" alt="'+directions_flag+'" title="'+directions_flag+'" /></a>';
					  }
					  aObj.closest('.card').addClass('active');
					  let info_panel=aObj.parent().find('.card-body');
					  
					 
					  info_panel.html(setInfoTxt);
						$('.mobile-desc').html('<h5>'+popTitle+'</h5>'+setInfoTxt).addClass('d-inline');
						


					}
				}


				map.loadImage('../images/LFF-info.png', (error, image) => {
					if (error) throw error;
					map.addImage('custom-marker', image);
				});


				map.loadImage('../images/LFF-bike.png', (error, image) => {
					if (error) throw error;
					map.addImage('bike-marker', image);
				});


				map.addSource('points', {
					'type': 'geojson',
					'data': {
					'type': 'FeatureCollection',
					'features': [
					{

					'type': 'Feature',
					'geometry': {
					'type': 'Point',
					'coordinates': [
					8.796647722205217, 46.16965582334466
					]
					},
					'properties': {
					'title': 'Info Point'
					}
					},
					{

					'type': 'Feature',
					'geometry': {
					'type': 'Point',
					'coordinates': [8.789048104484467, 46.164011673039354 ]
					},
					'properties': {
					'title': 'Info Point'
					}
					},
					{

					'type': 'Feature',
					'geometry': {
					'type': 'Point',
					'coordinates': [8.79472956831609, 46.169084041321966 ]
					},
					'properties': {
					'title': 'Info Point'
					}
					},
					{

					'type': 'Feature',
					'geometry': {
					'type': 'Point',
					'coordinates': [8.79586599922836, 46.16942704633847 ]
					},
					'properties': {
					'title': 'Festival Center'
					}
					}
					]
					}
				});
	
	
				map.addSource('bike', {
					'type': 'geojson',
					'data': {
					'type': 'FeatureCollection',
					'features': [
					{

					'type': 'Feature',
					'geometry': {
					'type': 'Point',
					'coordinates': [
					8.7983530469542, 46.16978553664626
					]
					},
					'properties': {
					'title': 'Bike Rental'
					}
					}
					
					]
					}
				});
	

				map.addLayer({
					'id': 'points',
					'type': 'symbol',
					'source': 'points',
					'layout': {
					'icon-image': 'custom-marker',

					'text-field': ['get', 'title'],
					'text-font': [
					'Open Sans Semibold',
					'Arial Unicode MS Bold'
					],
					'text-offset': [-2, 0],
					'text-anchor': 'right',
					'text-size': 10
					},
					paint: {
						"text-color": "#ffffff"
					  }
				});
					
					
				map.addLayer({
					'id': 'bike',
					'type': 'symbol',
					'source': 'bike',
					'layout': {
					'icon-image': 'bike-marker',

					'text-field': ['get', 'title'],
					'text-font': [
					'Open Sans Semibold',
					'Arial Unicode MS Bold'
					],
					'text-offset': [-2, 0],
					'text-anchor': 'right',
					'text-size': 10
					},
					paint: {
						"text-color": "#ffffff"
					  }
				});
});
}


	showOtherLocations=function() {
		$('.theaters-inner').slideUp(300, function() {
			$('.theathers-menu').removeClass('sec-active');
			$('.others-menu').addClass('sec-active');
			$('.locations-inner').slideDown(300);
		})
	}

	showTheaters=function() {
			$('.locations-inner').slideUp(300, function() {
				$('.theathers-menu').addClass('sec-active');
				$('.others-menu').removeClass('sec-active');
				$('.theaters-inner').slideDown(300);
			})
	}