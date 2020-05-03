import Rails from "@rails/ujs"
Rails.start()

import * as ActiveStorage from "@rails/activestorage"
ActiveStorage.start()

import Turbolinks from "turbolinks"
Turbolinks.start()

import './channels'

import { application } from 'campo-ui/dist/js/campo-ui'
import { definitionsFromContext } from "stimulus/webpack-helpers"

const context = require.context("./controllers", true, /\.js$/)
application.load(definitionsFromContext(context))
