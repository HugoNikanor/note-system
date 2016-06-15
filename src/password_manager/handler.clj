(ns password-manager.handler
  (:require [compojure.core :refer :all]
            [compojure.route :as route]
            [ring.middleware.defaults :refer [wrap-defaults site-defaults]]
            [password-manager.database :as db]
            [password-manager.security :as security]
            [password-manager.html :as html]
            [password-manager.json :as json]
            [other.call :refer :all]))

(defroutes app-routes
  (GET "/" [] "Hello World")
  (route/resources "/")
  (context "/password" []
           ;(context "/:type" [type]
           (GET "/" [service username email show-old]
                ;(str "default"))
                (let [entries (db/query service username email show-old)]
                  ;(call (str type "/get-formated") entries)))
                  (html/get-formated entries)))
                  ;(json/get-formated entries)))
           (GET "/:type" [type]
                (str type)))
  (route/not-found "Not Found"))


(def app
  (wrap-defaults app-routes site-defaults))
