(ns password-manager.handler
  (:require [compojure.core :refer :all]
            [compojure.route :as route]
            [ring.middleware.defaults :refer [wrap-defaults site-defaults]]
            [hiccup.core :refer :all]))

(defroutes app-routes
  (GET "/" [] "Hello World")
  (route/resources "/")
  (context "/password" []
           ; [s a] [service
           ;        account]
           (GET "/" [s a]
                ; select * from passwords where service=s [and account=a];
                (html [:table {:border "1"}
                       [:tr 
                        [:td [:strong "Service"]]
                        [:td [:strong "Information"]]]
                       [:tr
                        [:td s]
                        [:td a]]])
                ))
  (route/not-found "Not Found"))

(def app
  (wrap-defaults app-routes site-defaults))
