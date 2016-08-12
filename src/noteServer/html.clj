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
                     [:ul.checkbox-list {:data-note-id note-id :data-module-id module-id}
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
                      ;; It's also needed when creating new lists
                      ;; Note that that would require a bit more work,
                      ;; since the note and module id need to be known
                      ;; when submitting the form.
                      ;; But with some creative selector going upwards
                      ;; this might not be a problem
                      [:li.new-item
                       [:form {:name "new-bullet"}
                        ;; TODO also check that input isn't empty backend
                        (text-field {:class "seamless" :placeholder "New bullet" :required "true"} "text")
                        (submit-button {:class "seamless"} "→")
                        (hidden-field "module-id" module-id)
                        (hidden-field "note-id" note-id)]]]
                     "image"
                     [:img {:src (:image_src data) :title (:title_text data)}]
                     "header"
                     [:h1 (:text data)]
                     "text"
                     [:p (:text data)])]))
              modules)

         [:span.module-divide]

         [:div.meta-module.footer-module {:role "module"}
          [:span.id "Id: " note-id]]]))
    entries))
