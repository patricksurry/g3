import * as d3 from 'd3';
import { css } from '@emotion/css';


export const identity = v => v;


export function appendId(typ) {
    return typ + (++appendId.nextId).toString(36);
}
appendId.nextId = 0;


export function stylable(f) {
    var kls = [],
        style;

    f.stylable = function (selection) {
        if (kls.length) selection.attr('class', f.class());
        if (style) selection.attr('style', f.style());
    }
    f.css = function(_) {
        return arguments.length ? (kls.push(css(_)), f) : kls.join(' ');
    }
    f.class = function(_) {
        return arguments.length ? (kls = kls.concat(_.split(' ')), f) : kls.join(' ');
    }
    f.style = function(_) {
        return arguments.length ? (style = _, f): style;
    }
    return f;
}


export function transformable(f) {
    var x=0, y=0, scalex=1, scaley=1, rotate=0;

    f.transformable = function(selection) {
        selection.attr('transform', `translate(${x}, ${y}) rotate(${rotate}) scale(${scalex}, ${scaley})`);
    }
    f.x = function(_) {
        return arguments.length ? (x = _, f) : x;
    }
    f.y = function(_) {
        return arguments.length ? (y = _, f) : y;
    }
    f.scale = function(x,y) {
        return arguments.length ? (scalex = x, scaley = y ?? x, f) : [scalex, scaley];
    }
    f.rotate = function(_) {
        return arguments.length ? (rotate = _, f) : rotate;
    }
    return f;
}


export function appendable(f) {
    var defs = [],
        kids = [];

    f.appendable = function(sel, g) {
        if (defs.length) {
            let _ = d3.select(sel.node().ownerSVGElement).select('defs');
            if (_.empty()) throw "Couldn't find svg defs element"
            _.selectAll(null)
                .data(defs)
              .enter().each(function(d) { d3.select(this).call(d, g)});
        }
        sel.selectAll(null)
            .data(kids)
          .enter().each(function(d) { d3.select(this).call(d, g); });
    }
    f.defs = function(..._) {
        return arguments.length ? (defs = defs.concat(_), f) : defs;
    }
    f.append = function(..._) {
        return arguments.length ? (kids = kids.concat(_), f) : kids;
    }
    return f;
}
