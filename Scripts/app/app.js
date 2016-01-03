var applicationId = "owSI6NpP3DSUj0RywWQLvedo0Ul6uXdPXdm0pVzE";
var javascriptKey = "by3QlICJVlJegsbnlHXR9zet11p5Kit4Mi9DKK77";


var ViewModel = function () {
   var self = this;
   //var idiomsUri = "http://" + applicationId + ":javascript-key=" + javascriptKey + "@api.parse.com/1/classes/Idiom/"
   var idiomsUri = "https://api.parse.com/1/classes/Idiom/";
   self.error = ko.observable();
   self.isLoading = ko.observable(false);
   self.idioms = ko.observableArray();

   self.selectedIdiom = ko.observable({});

   function ajaxHelper(uri, method, data) {
      self.error(''); // Clear error message
      return $.ajax({
         type: method,
         url: uri,
         dataType: 'json',
         contentType: 'application/json',
         headers: {
            'X-Parse-Application-Id': applicationId,
            'X-Parse-REST-API-Key': javascriptKey
         },
         data: data ? JSON.stringify(data) : null
      }).fail(function (jqXHR, textStatus, errorThrown) {
         self.error(errorThrown);
      });
   }

   function getAllIdioms() {
      self.isLoading(true);
      ajaxHelper(idiomsUri, 'GET').done(function (data) {
         self.isLoading(false);
         self.idioms(data.results);
      });
   };

   self.selectIdiom = function (item) {
      self.selectedIdiom({
         objectId: item.objectId, name: item.name, furigana: item.furigana, idiomDescription: item.idiomDescription
      });
   };

   self.isSelectedIdiom = function (objectId) {
      var selectedIdiom = self.selectedIdiom();
      if (selectedIdiom && objectId) {
         return selectedIdiom.objectId === objectId;
      }
      return false;
   };

   self.addIdiom = function () {
      var idiom = {
         name: "",
         furigana: "",
         idiomDescription: ""
      };
      self.selectedIdiom(idiom);
   };

   self.saveIdiom = function (formElement) {
      var idiom = selectedIdiom();
      self.isLoading(true);
      console.log(idiom.objectId);
      if (idiom.objectId) {// update
         console.log("update " + idiom);
         ajaxHelper(idiomsUri + idiom.objectId, 'PUT', idiom).done(function (e) {
            var idx = -1;
            for (var i = 0; i < self.idioms().length; i++) {
               if (self.idioms()[i].objectId === idiom.objectId) {
                  idx = i; break;
               }
            }
            self.idioms.splice(idx, 1);
            self.idioms.splice(idx, 0, idiom);
            self.isLoading(false);
            console.log(JSON.stringify(idiom));
         });

      } else {
         // add
         var exist = isIdiomExist(idiom);
         if (exist) {
            self.error("このイディオムは既に存在しています。");
            self.isLoading(false);
            return;
         }
         console.log("insert " + exist);
         ajaxHelper(idiomsUri, 'POST', idiom).done(function (i) {
            idiom.objectId = i.objectId;
            self.idioms.push(idiom);
            self.isLoading(false);
         });
      }
   }

   self.isIdiomExist = function(idiom) {
      for (var i = 0; i < self.idioms().length; i++) {
         var id = self.idioms()[i];
         if (id.name === idiom.name) {
            return true;
         }
      }
      return false;
   }

   getAllIdioms();
};
ko.applyBindings(ViewModel);

