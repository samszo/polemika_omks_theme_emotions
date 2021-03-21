    //connexion anonyme
    function connectGuest(){
        $.ajax({
          type: 'GET',
          url: "http://localhost/polemika/omk/api/login",
          data: {
            "email":"anonyme.polemika@univ-paris8.fr"
            ,"password":"anonyme"
          }
          }).done(function(data) {
            console.log(data)
            getUser(data['o:user']['@id'],data.key_identity, data.key_credential);
          })
          .fail(function(e) {
            console.log(e)
        });      
      }
  
      function getUser(url, i, c){
        $.ajax({
          type: 'GET',
          url: url,
          data: {
              'key_identity' : i,
              'key_credential' : c
          }
          }).done(function(data) {
            console.log(data)
            d3.select('.user-id').text(data['o:name'])
          })
          .fail(function(e) {
            console.log(e)
        });      
      }