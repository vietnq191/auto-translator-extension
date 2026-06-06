import { GoogleProvider } from '@/core/providers/google-provider'
import { Translator } from '@/core/translator'
import { registerMessageRouter } from './message-router'

/* Service-worker entry: wire the provider into the translator and start the router. */
const translator = new Translator(new GoogleProvider())
registerMessageRouter(translator)
