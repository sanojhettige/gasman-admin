'use strict';
angular.module('gasAdmin').controller('ErrorCtrl', ErrorCtrl);

ErrorCtrl.$inject = ['initPageContent'];

function ErrorCtrl(initPageContent) {
  var vm = this;

  vm.pageContent = initPageContent;
  vm.pageContent.customHeaderUrl = 'views/tmpls/error-header.template.html';
  vm.pageContent.customFooterUrl = 'views/tmpls/error-footer.template.html';
}
