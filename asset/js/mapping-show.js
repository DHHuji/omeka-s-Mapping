$(document).ready( function() {

const mappingMap = $('#mapping-map');
const mappingData = mappingMap.data('mapping');
const queryFeaturesQuery = mappingMap.data('queryFeaturesQuery') || mappingMap.data('featuresQuery');

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

const queryItemsQuery = mappingMap.data('queryItemsQuery');
const highlightResourceId = mappingMap.data('highlightResourceId');

let highlightedFeaturesPoint = null;
let highlightedFeaturesPoly = null;
if (queryItemsQuery && highlightResourceId) {
    highlightedFeaturesPoint = L.featureGroup();
    highlightedFeaturesPoly = L.featureGroup();
    features.addLayer(highlightedFeaturesPoint).addLayer(highlightedFeaturesPoly);
}

const highlightedFeatures = function() {
    if (!highlightedFeaturesPoint || !highlightedFeaturesPoly) {
        return null;
    }
    return L.featureGroup([highlightedFeaturesPoint, highlightedFeaturesPoly]);
};

let defaultBounds = null;
if (mappingData && mappingData['o-module-mapping:bounds'] !== null) {
    const bounds = mappingData['o-module-mapping:bounds'].split(',');
    const southWest = [bounds[1], bounds[0]];
    const northEast = [bounds[3], bounds[2]];
    defaultBounds = [southWest, northEast];
}

const setView = function() {
    if (defaultBounds) {
        map.fitBounds(defaultBounds);
    } else if (queryItemsQuery && highlightResourceId) {
        const bounds = highlightedFeatures().getBounds();
        if (bounds.isValid()) {
            map.fitBounds(bounds, {padding: [50, 50]});
        }
    } else {
        const bounds = features.getBounds();
        if (bounds.isValid()) {
            map.fitBounds(bounds, {padding: [50, 50]});
        }
    }
};

const onFeaturesLoad = function() {
    if (!map.mapping_map_interaction) {
        // Call setView only when there was no map interaction. This prevents the
        // map view from changing after a change has already been done.
        setView();
    }
};

if (queryItemsQuery && highlightResourceId) {
    MappingModule.loadFeaturesAsync(
        map,
        featuresPoint,
        featuresPoly,
        mappingMap.data('featuresUrl'),
        mappingMap.data('featurePopupContentUrl'),
        JSON.stringify(queryItemsQuery),
        JSON.stringify(queryFeaturesQuery),
        onFeaturesLoad,
        {},
        1,
        {
            skipResourceIds: [highlightResourceId],
        }
    );
    MappingModule.loadFeaturesAsync(
        map,
        highlightedFeaturesPoint,
        highlightedFeaturesPoly,
        mappingMap.data('featuresUrl'),
        mappingMap.data('featurePopupContentUrl'),
        JSON.stringify({id: highlightResourceId}),
        JSON.stringify(mappingMap.data('featuresQuery')),
        onFeaturesLoad,
        {},
        1,
        {
            pointToLayer: function(feature, latlng) {
                return L.marker(latlng, {
                    icon: new L.Icon.Default({
                        className: 'mapping-marker-highlight',
                    }),
                });
            },
            styleOptions: {
                defaultPolyStyle: {
                    color: '#b42318',
                },
                activePolyStyle: {
                    color: '#f97066',
                },
            },
        }
    );
} else {
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
}

// Switching sections changes map dimensions, so make the necessary adjustments.
$('#mapping-section').one('o:section-opened', function(e) {
    map.invalidateSize();
    setView();
});

});
