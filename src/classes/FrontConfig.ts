
class FrontConfig {
  private static _instance: FrontConfig
  public static get instance (): FrontConfig {
    if (!this._instance) {
      this._instance = new FrontConfig()
    }
    return this._instance
  }

  set useLocalStorage (value: boolean) {
    window.localStorage.useLocalStorage = value ? 'on' : 'off'
  }
  get useLocalStorage (): boolean {
    const restoredValue = window.localStorage.useLocalStorage
    return restoredValue === 'on'
  }
}
const frontConfig = FrontConfig.instance
export default frontConfig
