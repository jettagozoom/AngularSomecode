someCodeApp.controller('HeaderCtrl', ['$scope', '$location', 'oauthLibrary', 'snippetLogout',
                              function($scope,   $location,   oauth,          snippetLogout) {

    $scope.$watch(function() {
        return $scope.isAuthenticated();
    },
    function(newVal, oldVal) {
        if (newVal) {
            $scope.username = oauth.username();
            $scope.hideSignin();
        }
    });

    $scope.showSignin = function() {
        $('.signinModal').modal('show');
    };

    $scope.hideSignin = function() {
        $('.signinModal').modal('hide');
    };

    $scope.authenticate = function(provider) {
        oauth.authenticate(provider).then(function(response) {
            $location.path('/user');
        });
    };

    $scope.isAuthenticated = function(provider) {
        return oauth.isAuthenticated();
    };

    $scope.logout = function() {
        snippetLogout().then(function(response) {
            oauth.logout();
        }, function(error) {
            console.log(error.url + " failed with status error " + error.statusCode);
        })
        .finally(function() {
            $location.path('/');
        });
    };
}])

.directive('snippetSearch', function() {
    return {
        restrict: 'E',
        templateUrl: 'static/header/snippetSearch.html',
        transclude: false,
        controller: function($scope, $element, $attrs) {
            $scope.computeLayout = function() {
                if ($scope.isSignedIn) {
                    return {'min-width':'290px'};
                } else {
                    return {'min-width':'220px'};
                }
            }
        },
        link: function ($scope, element, attrs, snippetSearchController) {
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
        link: function($scope, $element, $attrs) {
            var widthPct = 25;

            $(window).on('resize', function() {
                $scope.$apply(function () {
                    computeSearchInputWidth();
                })
            });
            function computeSearchInputWidth() {
                $element.width(window.innerWidth * widthPct/100);
            }
            computeSearchInputWidth();
        }
    }
})
