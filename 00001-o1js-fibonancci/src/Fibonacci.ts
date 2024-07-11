import { Field, SmartContract, state, State, method, Permissions } from 'o1js';

export class Fibonacci extends SmartContract {
  @state(Field) a = State<Field>();
  @state(Field) b = State<Field>();

  init() {
    super.init();
    this.a.set(Field(0));
    this.b.set(Field(1));
    this.account.permissions.set({
      ...Permissions.default(),
    });
  }

  @method async fibonacci() {
    let a = this.a.getAndRequireEquals();
    let b = this.b.getAndRequireEquals();
    let t = Field(0);
    for (let i = 0; i < 10; i += 1) {
      t = a.add(b);
      t.assertEquals(a.add(b));
      a = b;
      b = t;
    }
    this.a.set(t);
    this.b.set(a.add(b));
  }
}
