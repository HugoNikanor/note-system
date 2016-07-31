(ns noteServer.html
  (:require [hiccup.core :refer :all]
            [hiccup.page :refer :all]
            [hiccup.def :refer [defhtml]]
            [noteServer.security :as security])
  )

(defhtml format-notes [entries]
  (println entries)
  (map 
    (fn [note]
      (println note)
      (let [id (:id note)
            modules (:modules note)]
        [:article.note {:id (str "note-" id) :data-id id}
         (map (fn [module]
                (println module)
                (let [type (:type module)
                      id (:id module)
                      data (:data module)]
                  [:div.module {:data-id id :data-type type}
                   (println type)
                   (case type
                         "list"
                         [:ul.checkbox-list ;TODO class-name?
                          (map (fn [li]
                                 (let [d (:done li)
                                       id (:id li)
                                       text (:text li)]
                                   [:li {:class (if d "checked" "")
                                         :data-id id}
                                    text]))
                               data)]
                         "image"
                         [:img {:src (:image_src data) :title (:title_text data)}]
                         "header"
                         [:h1 (:text data)]
                         "text"
                         [:p (:text data)])]))
              modules)
         [:footer
          [:span.id "Id: " id]]]))
    entries))




  

(defn get-formated-note [note]
  (html
    [:article {:id (:id note)}
     [:h1 (:header note)]
     [:p (:body note)]]))
