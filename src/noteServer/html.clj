(ns noteServer.html
  (:require [hiccup.core :refer :all]
            [hiccup.page :refer :all]
            [hiccup.def :refer [defhtml]]
            [noteServer.security :as security])
  )

;; TODO split this into multiple functions, so it gets readable
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
         [:div.module.meta-control
          [:button.edit-module-btn [:object {:type "image/svg+xml" :data "img/pencil.svg"}]]
          ;; TODO rename pre module button class
          [:button.pre-module-btn [:object {:type "image/svg+xml" :data "img/circle-plus.svg"}]]
          [:button.delete-module-btn [:object {:type "image/svg+xml" :data "img/large-x.svg"}]]
          ]
         [:footer
          [:span.id "Id: " id]]]))
    entries))
