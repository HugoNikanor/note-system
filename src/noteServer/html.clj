(ns noteServer.html
  (:require [hiccup.core :refer :all]
            [hiccup.page :refer :all]
            [hiccup.def :refer [defhtml]]
            [hiccup.form :refer :all]
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
                           data)
                      ;; Possibly move the form to a template, both to save
                      ;; bytes, and to only show it when js is active
                      [:li.new-item
                       [:form {:name "new-bullet"}
                        (text-field {:class "seamless" :placeholder "New bullet"} "text")
                        (submit-button {:class "seamless"} "→")
                        (hidden-field {:data-module-id module-id :data-note-id note-id} "list-id")]]]
                     "image"
                     [:img {:src (:image_src data) :title (:title_text data)}]
                     "header"
                     [:h1 (:text data)]
                     "text"
                     [:p (:text data)])]))
              modules)

         [:span.module-divide]

         [:div.footer-module {:role "module"}
          [:span.id "Id: " note-id]]]))
    entries))
