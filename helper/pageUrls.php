<?php
namespace OmekaTheme\Helper;

use Zend\View\Helper\AbstractHelper;

class pageUrls extends AbstractHelper
{
    /**
     * Récupère les url utiles pour une page
     *
     * @param array   $props    les propriétés utiles
     * @param o:item  $item     la ressource
     * @param string  $type     le type de ressource
     * 
     * @return array
     */
    public function __invoke($props, $item, $type)
    {
        $view = $this->getView();
        $urls = [];
        $urlAjax = str_replace('emotions','api', $props['site']->siteUrl())."/page/ajax?json=1";
        //paramètre l'url de l'autocompletion
        $urls["autoComplete"] = $view->basePath()."/api/items?";
        if($type=='rapports'){
            $urls["aleaPhotoMondes"] = $urlAjax."&type=aleaPhotoMondes";
            $urls["ajoutRapport"] = $urlAjax."&type=ajoutRapport";
            $urls["aleaItem"] = $urlAjax."&type=aleaItem";
            $urls["calculEmotions"] = $urlAjax."&type=calculEmotions";                                    
        }        
        $urls["autoComplete"] .= "&sort_by=title"
                ."&property[0][type]=in&property[0][text]=";        

        return $urls;
    }
}