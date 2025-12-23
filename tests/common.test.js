import { element, put, snapScale } from '../src/common.js';
import * as d3 from 'd3';

describe('common module', () => {
  describe('snapScale', () => {
    test('should create a snap scale function', () => {
      const scale = snapScale();
      expect(typeof scale).toBe('function');
    });

    test('snapScale should snap values to nearest step', () => {
      const scale = snapScale();
      const value = scale(0.5);
      expect(typeof value).toBe('number');
    });

    test('snapScale should allow custom step configuration', () => {
      const scale = snapScale();
      const result = scale.step(5);
      expect(result).toBe(scale);
      expect(scale.step()).toBe(5);
    });

    test('snapScale should support start configuration', () => {
      const scale = snapScale();
      scale.start(10);
      expect(scale.start()).toBe(10);
    });

    test('snapScale should support strength configuration', () => {
      const scale = snapScale();
      scale.strength(3);
      expect(scale.strength()).toBe(3);
    });

    test('snapScale methods should be chainable', () => {
      const scale = snapScale();
      const result = scale.step(2).start(0).strength(5);
      expect(result).toBe(scale);
    });
  });

  describe('element', () => {
    test('should create an element constructor', () => {
      const el = element('circle');
      expect(typeof el).toBe('function');
    });

    test('element constructor should have attr method', () => {
      const el = element('rect');
      expect(typeof el.attr).toBe('function');
    });

    test('element should accept initial attributes', () => {
      const el = element('circle', { r: 10, cx: 5 });
      expect(el.attr('r')).toBe(10);
      expect(el.attr('cx')).toBe(5);
    });

    test('element attr method should be chainable', () => {
      const el = element('line');
      const result = el.attr('x1', 0);
      expect(result).toBe(el);
    });

    test('element should set attributes correctly', () => {
      const el = element('rect');
      el.attr('width', 100);
      el.attr('height', 50);
      expect(el.attr('width')).toBe(100);
      expect(el.attr('height')).toBe(50);
    });

    test('element should support inline attributes', () => {
      const el = element('rect', {width: 100, height: 50});
      expect(el.attr('width')).toBe(100);
      expect(el.attr('height')).toBe(50);
    })
  });

  describe('element DOM operations', () => {
    let container;

    beforeEach(() => {
      container = document.createElement('div');
      container.id = 'target';
      document.body.appendChild(container);
    });

    afterEach(() => {
      document.body.removeChild(container);
    });

    test('should add element as child to d3 selection', () => {
      const el = element('rect');
      const selection = d3.select('#target');
      el(selection);

      const rect = container.querySelector('rect');
      expect(rect).not.toBeNull();
      expect(rect.tagName).toBe('RECT');
    });

    test('should apply initial attributes to created element', () => {
      const el = element('circle', { r: 10, cx: 5, cy: 8 });
      const selection = d3.select('#target');
      el(selection);

      const circle = container.querySelector('circle');
      expect(circle.getAttribute('r')).toBe('10');
      expect(circle.getAttribute('cx')).toBe('5');
      expect(circle.getAttribute('cy')).toBe('8');
    });

    test('should create SVG elements with proper namespace', () => {
      const el = element('line');
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      container.appendChild(svg);
      const selection = d3.select(svg);
      el(selection);

      const line = svg.querySelector('line');
      expect(line).not.toBeNull();
    });

    test('should handle multiple elements with different attributes', () => {
      const rect = element('rect', { width: 100, height: 50 });
      const circle = element('circle', { r: 25 });

      const selection = d3.select('#target');
      rect(selection);
      circle(selection);

      expect(container.querySelectorAll('rect')).toHaveLength(1);
      expect(container.querySelectorAll('circle')).toHaveLength(1);
      expect(container.querySelector('rect').getAttribute('width')).toBe('100');
      expect(container.querySelector('circle').getAttribute('r')).toBe('25');
    });
  });

  describe('put DOM operations', () => {
    let container;

    beforeEach(() => {
      container = document.createElement('div');
      container.id = 'target';
      document.body.appendChild(container);
    });

    afterEach(() => {
      document.body.removeChild(container);
    });

    test('should add group element to selection', () => {
      const p = put();
      const selection = d3.select('#target');
      p(selection);

      const group = container.querySelector('g');
      expect(group).not.toBeNull();
      expect(group.tagName).toBe('G');
    });

    test('should create nested groups', () => {
      const outer = put();
      const inner = put();

      const selection = d3.select('#target');
      outer(selection);

      const outerGroup = container.querySelector('g');
      const innerSelection = d3.select(outerGroup);
      inner(innerSelection);

      const groups = container.querySelectorAll('g');
      expect(groups).toHaveLength(2);
    });
  });
});
