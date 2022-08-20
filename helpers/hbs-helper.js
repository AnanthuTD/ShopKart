import { registerHelper } from 'handlebars';
registerHelper("inc",(value)=>{
  return parseInt(value)+1;
})
