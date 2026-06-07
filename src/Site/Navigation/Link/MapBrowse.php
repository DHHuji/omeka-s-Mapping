<?php
namespace Mapping\Site\Navigation\Link;

use Mapping\Module;
use Omeka\Api\Representation\SiteRepresentation;
use Omeka\Site\Navigation\Link\LinkInterface;
use Omeka\Stdlib\ErrorStore;

class MapBrowse implements LinkInterface
{
    public function getName()
    {
        return 'Map browse'; // @translate
    }

    public function getFormTemplate()
    {
        return 'common/navigation-link-form/mapping-map-browse';
    }

    public function isValid(array $data, ErrorStore $errorStore)
    {
        if (
            isset($data['default_zoom'])
            && '' !== (string) $data['default_zoom']
            && !is_numeric($data['default_zoom'])
        ) {
            $errorStore->addError('default_zoom', 'Default zoom level must be a number.'); // @translate
        }
        if (
            isset($data['default_latitude'])
            && '' !== (string) $data['default_latitude']
            && (!is_numeric($data['default_latitude']) || $data['default_latitude'] < -90 || $data['default_latitude'] > 90)
        ) {
            $errorStore->addError('default_latitude', 'Default latitude must be a number between -90 and 90.'); // @translate
        }
        if (
            isset($data['default_longitude'])
            && '' !== (string) $data['default_longitude']
            && (!is_numeric($data['default_longitude']) || $data['default_longitude'] < -180 || $data['default_longitude'] > 180)
        ) {
            $errorStore->addError('default_longitude', 'Default longitude must be a number between -180 and 180.'); // @translate
        }

        if ($errorStore->hasErrors()) {
            return false;
        }

        return true;
    }

    public function getLabel(array $data, SiteRepresentation $site)
    {
        return isset($data['label']) && '' !== trim($data['label'])
            ? $data['label'] : $this->getName();
    }

    public function toZend(array $data, SiteRepresentation $site)
    {
        $query = [];
        if ($basemapProvider = self::getBasemapProvider($data)) {
            $query['mapping_basemap_provider'] = $basemapProvider;
        }
        if (self::hasDefaultView($data)) {
            $query['mapping_default_zoom'] = $data['default_zoom'];
            $query['mapping_default_latitude'] = $data['default_latitude'];
            $query['mapping_default_longitude'] = $data['default_longitude'];
        }
        return [
            'route' => 'site/mapping',
            'params' => [
                'site-slug' => $site->slug(),
                'controller' => 'index',
                'action' => 'browse',
            ],
            'query' => $query,
        ];
    }

    public function toJstree(array $data, SiteRepresentation $site)
    {
        return [
            'label' => $data['label'],
            'basemap_provider' => (string) self::getBasemapProvider($data),
            'default_zoom' => isset($data['default_zoom']) ? (string) $data['default_zoom'] : '',
            'default_latitude' => isset($data['default_latitude']) ? (string) $data['default_latitude'] : '',
            'default_longitude' => isset($data['default_longitude']) ? (string) $data['default_longitude'] : '',
        ];
    }

    public static function getBasemapProvider(array $data)
    {
        $basemapProvider = null;
        if (isset($data['basemap_provider']) && in_array($data['basemap_provider'], Module::BASEMAP_PROVIDERS)) {
            $basemapProvider = $data['basemap_provider'];
        }
        return $basemapProvider;
    }

    public static function hasDefaultView(array $data)
    {
        return isset($data['default_zoom'], $data['default_latitude'], $data['default_longitude'])
            && '' !== (string) $data['default_zoom']
            && '' !== (string) $data['default_latitude']
            && '' !== (string) $data['default_longitude'];
    }
}
