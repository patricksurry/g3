import * as d3 from 'd3';
import * as g3 from '../g3.js';


g3.fakeMetrics.register({
    time: g3.midnightSecondsSeries(),
    elapsed: g3.elapsedSecondsSeries(),
    date: g3.datetimeSeries(),
});


g3.gauge('clockSimple')
    .metric('time').unit('s')
    .measure(d3.scaleLinear().domain([0, 60]).range([0, 360]))
    .append(
        g3.gaugeFace(),
        g3.axisTicks().step(5).size(10),
        g3.axisTicks(d3.range(0, 60).filter(v => v % 5)).shape('dot').size(1).inset(2).style('stroke: none; fill: white'),
        g3.axisLabels().step(5).start(5).format(v => v/5).inset(20),
        g3.indicatePointer().shape('blade').rescale(v => v/60/12),
        g3.indicatePointer().shape('sword').rescale(v => v/60),
        g3.indicatePointer().rescale(g3.snapScale()),
    );

const dowFormat = v => d3.timeFormat('%a')(v).slice(0,2).toUpperCase();

g3.gauge('casioF91W')
    .metric('date').unit('dateTime')
    .css('text.g3-indicate-text { fill: #20282C }')
    .append(
        g3.element('rect', {width: 200, height: 80, x: -100, y: -43}).attr('rx', 10).style('fill: #BCDCD8'),
        // am/pm
        g3.put().x(-65).y(-20).append(
            g3.indicateText().format(d3.timeFormat('%p')).size(15).style('font-family: Gill Sans; font-weight: normal;')
        ),
        // day of week
        g3.put().x(-5).y(-25).append(
            g3.indicateText().format(dowFormat).style('font-family: DSEG14-Classic')
        ),
        // day of month
        g3.put().x(70).y(-25).append(
            g3.indicateText().format(d3.timeFormat('%e')).style('font-family: DSEG14-Classic')
        ),
        g3.put().x(-20).y(10).append(
            g3.indicateText().format(d3.timeFormat('%_I:%M')).size(36).style('font-family: DSEG7-Classic')
        ),
        g3.put().x(65).y(14).append(
            g3.indicateText().format(d3.timeFormat('%S')).size(27).style('font-family: DSEG7-Classic')
        ),
    );


const
    tachyLabels =  [].concat(
        d3.range(60,95,5),
        d3.range(100,200,10),
        d3.range(200,300,25),
        d3.range(300,400,50),
        d3.range(400,600,100),
    ),
    noTachyLabels = (v => !tachyLabels.includes(v)),
    noNearlyFives = (v => Math.abs(v - 5*Math.round(v/5)) > 0.25);


// See https://en.wikipedia.org/wiki/Omega_Speedmaster tho this is a date variant
g3.gauge('omegaSpeedmaster')
    .metric('time').unit('s')
    .measure(d3.scaleLinear().domain([0,60]).range([0, 360]))
    .css(`
.g3-pointer-hub, .g3-pointer-blade {fill: #ddd; stroke: #ddd}
text {fill: #ccc}
.g3-highlight {fill-opacity: 0.5;}
`)
    .append(
        // indicate the date at the 3 o'clock position
        g3.put().rotate(90).append(
            g3.gauge().autoindicate(true)
                .metric('date').unit('dateTime')
                .rescale(dt => dt.getDate())
                .measure(d3.scaleLinear().domain([1,32]).range([0,360]))
                .append(
                    g3.axisLabels().step(1).orient('relative').rotate(-90).size(13).inset(45)
                ),
        ),
        g3.gaugeFace().window(
            g3.axisSector([13.75, 16.25]).inset(36).size(19).style('fill: black')
        ),
        g3.gaugeFace().r(45).style('fill: #282828'),
        g3.axisSector([13.75, 16.25]).inset(36).size(19).style('fill: none; stroke: #ccc; stroke-width: 3'),
        // watch outline and tachymetre divider
        g3.axisLine().style('stroke-width: 4; stroke: #aaa'),
        g3.axisSector().inset(14).size(10).style('fill: #aaa'),
        g3.axisSector().inset(17).size(1).style('fill: white; filter: url(#gaussianBlur1)'),
        // Gauge with no metric or pointer to render the inverted speed scale
        g3.gauge()
            .measure(d3.scalePow().exponent(-1).domain([60, 500]).range([360, 43.2]))
            .append(
                g3.axisTicks(d3.range(60,100).filter(noTachyLabels)).inset(12).size(-3),
                g3.axisTicks(d3.range(60,140,5).filter(noTachyLabels)).inset(12).size(-5),
                g3.axisTicks(tachyLabels).shape('dot').size(0.5).inset(12),
                g3.axisLabels(tachyLabels).inset(6).size(6),
            ),
        g3.axisLabels({3.6: 'TACHYMETRE'}).orient('clockwise').inset(7).size(7),
        // main face ticks
        g3.put().scale(0.72).append(
            g3.axisTicks(d3.range(0, 60, 0.2).filter(noNearlyFives)).size(3).style('stroke: #888'),
            g3.axisTicks(d3.range(0, 60, 1).filter(noNearlyFives)).size(8),
            g3.axisTicks([29, 31]).inset(3).size(5).class('g3-bg-stroke'),
            g3.axisTicks(d3.range(0, 60, 5).filter(v => v % 15)).inset(8).size(16)
                .shape('wedge').width(4).style('stroke-width: 3'),
            g3.axisLabels().step(5).start(5).format(d3.format('02d')).inset(2.5).size(7.5).orient('upward'),
        ),
        g3.axisLabels({31: 'SWISS', 29: 'MADE'}).orient('counterclockwise').inset(31.5).size(2.5),
        g3.element('image', {
            href: 'speedmaster_logo.png',
            width: 32,
            x: 9,
            y: -16,
        }),
        // Time seconds at the 9 o'clock position
        g3.put().x(-42).scale(0.25).append(
            g3.gaugeFace(),
            g3.axisLine().style('stroke: #aaa; stroke-width: 4'),
            g3.axisSector().size(50).style('fill: #282828'),
            g3.axisTicks(d3.range(5,60,5).filter(v => v % 15)).inset(5).size(20).style('stroke-width: 2'),
            g3.axisLabels().step(15).start(15).size(40),
            g3.indicatePointer().shape('wedge').rescale(g3.snapScale()),
        ),
        // gauge for chrono hour and minute
        g3.gauge()
            .metric('elapsed').unit('s')
            .measure(d3.scaleLinear().domain([0,60]).range([0, 360]))
            .append(
                // 30-minute counter at the 12 o'clock position
                g3.put().y(-42).scale(0.25).append(
                    // TODO need to manually scale ticks/labels for 30 minute counter
                    g3.gaugeFace(),
                    g3.axisLine().style('stroke: #aaa; stroke-width: 4'),
                    g3.axisSector().size(50).style('fill: #282828'),
                    g3.axisTicks(
                        d3.range(2, 60, 2)
                        .filter(v => Math.abs(v - Math.round(v/20)*20) > 2)
                    ).step(2).inset(5).size(10),
                    g3.axisTicks().start(10).step(20).inset(5).size(20).style('stroke-width: 2'),
                    g3.axisLabels().start(20).step(20).size(40).format(v => v/2),
                    g3.indicatePointer().shape('wedge').rescale(v => v/30),
                ),
                // 12-hour counter at the 6 o'clock position
                g3.put().y(42).scale(0.25).append(
                    g3.gaugeFace(),
                    g3.axisLine().style('stroke: #aaa; stroke-width: 4'),
                    g3.axisSector().size(50).style('fill: #282828'),
                    g3.axisTicks(d3.range(5,60,5).filter(v => v % 15)).inset(5).size(20).style('stroke-width: 2'),
                    g3.axisLabels().step(15).start(15).size(40).format(v => v/5),
                    g3.indicatePointer().shape('wedge').rescale(v => v/60/12),
                ),
        ),
        // time hours and minutes indicator
        g3.put().scale(0.75).append(
            g3.indicatePointer().shape('omega-baton-short').rescale(v => v/60/12),
            g3.indicatePointer().shape('omega-baton-long').rescale(v => v/60),
            // indicator for chrono seconds
            g3.gauge()
                .metric('elapsed').unit('s')
                .measure(d3.scaleLinear().domain([0,60]).range([0, 360]))
                .append(
                    g3.indicatePointer().shape('omega-second')
                ),
        ),
    );
