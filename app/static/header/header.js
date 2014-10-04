someCodeApp.controller('HeaderCtrl', ['$scope', function($scope) {
    $scope.isSignedIn = true;
    $scope.username = "jettagozoom";
    $scope.signinStateText = $scope.isSignedIn ? "Log Out" : "Sign In";
    $scope.computeLayout = function() {
        if ($scope.isSignedIn) {
            return {'min-width':'290px'};
        } else {
            return {'min-width':'220px'};
        }
    }
}])

.directive('snippetSearch', function() {
    return {
        restrict: 'E',
        templateUrl: 'static/header/snippetSearch.html',
        transclude: false,
        link: function ($scope, element, attrs) {
            var searchField = element.find('#snippetSearchField');
            $scope.focused = false;
            $scope.placeholderText = $scope.isSignedIn ? "Search private snippets" : "Search public snippets";

            searchField.on('click', function() {
                $scope.$apply(function() {
                    $scope.focused = true;
                })
            });
            searchField.on('blur', function() {
                $scope.$apply(function() {
                    $scope.focused = false;
                })
            });
        }
    }
})

// The 'searchSizer' attribute directive will attempt to keep the
// search input width at a percentage of the page width. This
// will allow for more room to provide search input on
// larger windows.
.directive('searchSizer', function() {
    return {
        link: function($scope, element, attrs) {
            var widthPct = 25;

            $(window).on('resize', function() {
                $scope.$apply(function () {
                    computeSearchInputWidth();
                })
            });
            function computeSearchInputWidth() {
                element.width(window.innerWidth * widthPct/100);
            }
            computeSearchInputWidth();
        }
    }
})
