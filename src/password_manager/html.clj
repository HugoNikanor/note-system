(ns password-manager.html
  (:require [hiccup.core :refer :all]
            [hiccup.page :refer :all]
            [password-manager.security :as security])
  )

(declare create-entry)

(def table-fields (map str ['service
                            'username
                            'email
                            'date-set
                            'note
                            'password]))

; TODO defhtml
(defn get-formated [entries]
  (html 
    [:table {:border "1"}
     [:tr 
      (map ;#([:td [:strong %]])
           #(vector :td [:strong %])
           table-fields)]
     (map create-entry entries)]))

; TODO defhtml
(defn create-entry [entry]
  (html
    [:tr
     (map #(vector :td ((keyword %) (security/decrypt-password entry)))
          table-fields)]))
