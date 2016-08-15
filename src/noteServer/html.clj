(ns noteServer.html
  (:require [hiccup.core :refer :all]
            [hiccup.page :refer :all]
            [hiccup.def :refer [defhtml]]
            [hiccup.form :refer :all]
            [clojure.java.io :as io]
            [noteServer.security :as security])
  )

(defhtml get-templates "Returns the templates" []
  (let [edit-img (slurp (io/resource "icons/edit.svg"))
        remove-img (slurp (io/resource "icons/remove.svg"))
        list-img (slurp (io/resource "icons/list.svg"))
        new-img (slurp (io/resource "icons/new.svg"))]
    [:template#meta-control-template
     ;; TODO add images for all these buttons
     [:div.meta-module.module-adder-module {:role "module"}
      [:div.button-spacer
       [:button.module-btn.header-module-btn {:name "header"} "H"]
       [:button.module-btn.text-module-btn   {:name "text"  } "T"]
       [:button.module-btn.list-module-btn   {:name "list"  } list-img]
       [:button.module-btn.image-module-btn  {:name "image" } "I"]
       [:button.module-btn.cancel-module-add-btn  {:name "cancel" } "C"]]]
     [:div.meta-module.remove-confirm-module {:role "module"}
      [:div.button-spacer
       [:button.remove-confirm-btn {:name "confirm"} "Really Delete"]
       [:button.remove-cancel-btn  {:name "cancel"} "Cancel"]]]
     [:div.meta-module.edit-control-module {:role "module"}
      [:div.button-spacer
       [:button {:name "save-edit"} "Save"]
       [:button {:name "cancel-edit"} "Cancel"]]]
     ;; TODO call this module something better
     [:div.meta-module.meta-control-module {:role "module"}
      [:div.button-spacer
       [:button.edit-module-btn edit-img]
       [:button.new-module-btn new-img]
       [:button.remove-module-btn remove-img]]]]))

;; TODO split this into multiple functions, so it gets readable
(defhtml format-notes "Get's all notes, formated and ready" [entries]
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
