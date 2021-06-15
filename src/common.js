import * as yup from "yup";
import * as d3 from 'd3';


//TODO
window.yup = yup;
window.d3 = d3;


export const
    DEG2RAD = Math.PI/180,
    axisProp = d3.local(),
    metricDispatch = d3.dispatch('metric');

export function classes(...vs) {
    return vs.filter(v => v).join(' ')
}

var nextId = 0;

export function dispatchId(typ) {
    return typ + (++nextId).toString(36);
}

// Using custom test method
function callable(message) {
  return this.test("callable", message, function (v) {
    const { path, createError } = this;
    if (typeof v != 'function') {
        return createError({ path, message: message ?? 'Callable object required'});
    }
    return true;
  });
}
yup.addMethod(yup.object, "callable", callable);



