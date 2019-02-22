
var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
var jwt;
function load_user() {
    return new Promise((res, rej) => {

        var cognitoUser = userPool.getCurrentUser();

        if (cognitoUser != null) {
            cognitoUser.getSession(function (err, session) {
                if (err) {
                    // alert(err);
                    res(false)
                    return;
                }
                console.log('session validity: ' + session.isValid());
                jwt = session.getAccessToken().getJwtToken()

                res(jwt)
            });
        }else{
            res(false)
        }
    })
}


function login() {
    username = $("#username_input").val()
    password = $("#password_input").val()
    var authenticationData = {
        Username: username,
        Password: password,
    };
    console.log(authenticationData)
    var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(authenticationData);

    var userData = {
        Username: username,
        Pool: userPool
    };
    var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
    cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: function (result) {
            var accessToken = result.getAccessToken().getJwtToken();

            /* Use the idToken for Logins Map when Federating User Pools with identity pools or when passing through an Authorization Header to an API Gateway Authorizer*/
            var idToken = result.idToken.jwtToken;
        },

        onFailure: function (err) {
            // alert(err);
            console.log(err)
        },
        newPasswordRequired: function (userAttributes, requiredAttributes) {
            $("#new_password").show()
            $("#new_password_submit").on("click", function(){
                cognitoUser.completeNewPasswordChallenge($("#new_password_input").val(), {
                    onSuccess: function(){
                        $("#new_password").hide()
                        $("#content").show()
                    },
                    onFailure: function(){

                    }
                }, this)
            })
        }
    });
}

function show_login(){
    $("#content").hide()
    $("#login").show()
    $("#loginBtn").on("click", function(){
        login()
    })
}
function show_content(){
    $("#content").show()
}
$(window).on("load", function () {
    console.log("LOAD")
    load_user().then((response)=>{
        if (response == false){
            show_login()
        }else{
            show_content()
        }
        // console.log("RESPONSE")
        // console.log(response)
    })
})