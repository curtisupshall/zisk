export default class InitializationContext {
    private initialized: boolean

    constructor() {
        this.initialized = false
    }

    setInitialized() {
        this.initialized = true
    }

    getInitialized() {
        return this.initialized
    }
}
