viewsModule.controller('SnippetsCtrl', ['$scope',
                                function($scope) {
    $scope.SnippetsCtrlScope = "SnippetsCtrlScope";
}])

.directive('snippet', ['$sce', 'snippetBarService',
               function($sce,   snippetBarService) {
    return {
        restrict: 'E',
        scope: true,
        templateUrl: './static/components/snippets/snippets.html',
        controller: function($scope, $element, $attrs) {
            $scope.layout = snippetBarService.snippetLayout;

            $scope.$on('snippetLayout', function(event, snippetLayout) {
                $scope.layout = snippetLayout;
            });
            this.setLayout = function(snippetLayout) {
                $scope.layout = snippetLayout;
            }
        },
        link: function(scope, element, attrs, snippetCtrl) {
            scope.snippetPopupVisible = false;
            scope.isPublicSnippet = function(snippetAccess) {
                return snippetAccess;
            };
            scope.isSnippetOwnedByCurrentUser = function(creatorId) {
                return true;
            };
            scope.getTrustedHtml = function(htmlStr) {
                return $sce.trustAsHtml(htmlStr);
            };
            scope.showSnippetPopup = function() {
                scope.snippetPopupVisible = true;
            };
            scope.hideSnippetPopup = function() {
                scope.snippetPopupVisible = false;
            };
        }
    }
}])

.directive('snippetPopup', function() {
    return {
        require: '?^snippet',
        restrict: 'E',
        templateUrl: './static/components/snippets/snippetPopup.html',
        link: function(scope, element, attrs, snippetCtrl) {
            scope.setLayout = function(layout) {
                snippetCtrl.setLayout(layout);
            }
        }
    }
});