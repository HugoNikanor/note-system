(ns password-manager.html
  (:require [hiccup.core :refer :all]
            [hiccup.page :refer :all]
            [password-manager.security :as security])
  )

(def table-fields (map str ['service
                            'username
                            'email
                            'date-set
                            'note
                            'password]))

; TODO defhtml
(defn create-entries-table [entries]
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
     (map #(vector :td ((keyword %) (assoc entry :password (security/decrypt (:password entry))))
          table-fields))]))
