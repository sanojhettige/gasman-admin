'use strict';

/**
 * factory.js
 *
 * @package    configs
 * @description factory module of the application.
 * @author     GLN <>
 *
 */

angular.module('gasAdmin').factory('PageHtml', function() {
  var title = 'Yoga Admin';
  var bodyClass = '';
  var htmlClass = '';
  var metaTags = '';
  var metaDesc = '';
  return {
    title: function() {
      return title;
    },
    setTitle: function(newTitle) {
      title = newTitle;
    },
    bodyClass: function() {
      return bodyClass;
    },
    setBodyClass: function(cls) {
      bodyClass = cls;
    },
    htmlClass: function() {
      return htmlClass;
    },
    setHtmlClass: function(cls) {
      htmlClass = cls;
    },
    metaKeywords: function() {
      return metaTags;
    },
    setMetaKeywords: function(tags) {
      metaTags = tags;
    },
    metaDescription: function() {
      return metaTags;
    },
    setMetaDescription: function(desc) {
      metaDesc = desc;
    },
    styleSheet: function() {
      return styleSheetColor;
    },
    setStyleSheet: function(color) {
      styleSheetColor = color;
    }
  };
});
