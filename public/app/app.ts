export class App {
  private stuff: string;

  constructor() {
    this.stuff = 'hello2u';
  }

  public init(): void {
    console.log(this.stuff);
  }
}
