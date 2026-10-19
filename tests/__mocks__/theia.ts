// Minimal Theia mock for unit tests
export const injectable = () => (target: any) => target;
export const inject     = (_token: any) => (_target: any, _key: string, _idx: number) => {};
export class ContainerModule { constructor(cb: any) { cb(() => {}); } }
export class BaseWidget { id=''; title={label:'',caption:'',iconClass:'',closable:true}; node=document.createElement('div'); }
export class Message {}
