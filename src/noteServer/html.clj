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
      (let [note-id (:id note)
            modules (:modules note)]
        [:article.note {:id (str "note-" note-id) :data-id note-id}
         (map (fn [module]
                (println module)
                (let [type (:type module)
                      module-id (:id module)
                      data (:data module)]
                  [:div {:class (str type "-module") :data-id module-id :data-type type :role "module"}
                   (println type)
                   (case type
                         "list"
                         [:ul.checkbox-list {:data-note-id note-id :module-id module-id}
                          (map (fn [li]
                                 (let [d (:done li)
                                       item-id (:id li)
                                       text (:text li)]
                                   [:li {:class (if d "checked" "")
                                         :data-id item-id}
                                    text]))
                               data)]
                         "image"
                         [:img {:src (:image_src data) :title (:title_text data)}]
                         "header"
                         [:h1 (:text data)]
                         "text"
                         [:p (:text data)])]))
              modules)
         [:div.meta-control-module {:role "module"}
          [:button.edit-module-btn [:object {:type "image/svg+xml" :data "icons/edit.svg"}]]
          ;; TODO rename pre module button class
          [:button.new-module-btn [:object {:type "image/svg+xml" :data "icons/new.svg"}]]
          [:button.delete-module-btn [:object {:type "image/svg+xml" :data "icons/delete.svg"}]]
          ]
         [:div.footer-module {:role "module"}
          [:span.id "Id: " note-id]]]))
    entries))
