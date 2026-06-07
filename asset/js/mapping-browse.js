$(document).ready( function() {

const mappingMap = $('#mapping-map');

const [
    map,
    features,
    featuresPoint,
    featuresPoly,
    baseMaps
] = MappingModule.initializeMap(mappingMap[0], {}, {
    disableClustering: mappingMap.data('disable-clustering'),
    basemapProvider: mappingMap.data('basemap-provider')
});

const setDefaultView = function() {
    const defaultLatitude = mappingMap.data('defaultLatitude');
    const defaultLongitude = mappingMap.data('defaultLongitude');
    const defaultZoom = mappingMap.data('defaultZoom');

    if (
        defaultLatitude !== ''
        && defaultLatitude !== undefined
        && defaultLongitude !== ''
        && defaultLongitude !== undefined
        && defaultZoom !== ''
        && defaultZoom !== undefined
    ) {
        map.setView([defaultLatitude, defaultLongitude], defaultZoom);
        return;
    }

    const bounds = features.getBounds();
    if (bounds.isValid()) {
        map.fitBounds(bounds);
    }
};

const onFeaturesLoad = function() {
    if (!map.mapping_map_interaction) {
        // Call setDefaultView only when there was no map interaction. This
        // prevents the map view from changing after a change has already been done.
        setDefaultView();
    }
};

MappingModule.loadFeaturesAsync(
    map,
    featuresPoint,
    featuresPoly,
    mappingMap.data('featuresUrl'),
    mappingMap.data('featurePopupContentUrl'),
    JSON.stringify(mappingMap.data('itemsQuery')),
    JSON.stringify(mappingMap.data('featuresQuery')),
    onFeaturesLoad
);

setDefaultView();

});
