import * as d3 from 'd3';
import { GraphMlEdge, GraphMlNode } from './util/graphMlTypes';

const getNoOfEdgesForNode = (node: GraphMlNode, edges: GraphMlEdge[]) => {
  return edges.filter(
    (e) =>
      e.attributes.source.nodeValue === node.id ||
      e.attributes.target.nodeValue === node.id
  ).length;
};

const resizeChart = () => {
  const chart = <SVGSVGElement>document.querySelector('#chart');
  const container = <HTMLDivElement>document.querySelector('#container');
  var targetWidth = container.getBoundingClientRect().width;
  var targetHeight = container.getBoundingClientRect().height;
  chart.setAttribute('width', targetWidth.toString());
  chart.setAttribute('height', targetHeight.toString());
};

export const renderChart = async () => {
  // set the dimensions and margins of the graph
  const margin = { top: 0, right: 0, bottom: 0, left: 0 };
  const width = 700 - margin.left - margin.right;
  const height = 500 - margin.top - margin.bottom;

  const chart = <SVGSVGElement>document.querySelector('#chart');

  d3.select(window).on('resize', resizeChart);

  // append the svg object to the body of the page
  const svg = d3
    .select('#chart')
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  const color = d3.scaleOrdinal(d3.schemeCategory10);

  const xml = await d3.xml('biblenames.xml');

  const data = d3.select(xml);
  const nodes = <GraphMlNode[]>(<unknown>data.selectAll('node').nodes());
  const edges = <GraphMlEdge[]>(<unknown>data.selectAll('edge').nodes());
  const links = edges.map((d) => {
    return {
      source: nodes.find((node) => node.id == d.attributes.source.nodeValue),
      target: nodes.find((node) => node.id == d.attributes.target.nodeValue),
      value: parseFloat(d.children[0].innerHTML), //the weight
    };
  });

  //prepare dragging
  const simulation = d3
    .forceSimulation()
    .force(
      'link',
      d3.forceLink().id(function (d) {
        return d.index.toString();
      })
    )
    .force('charge', d3.forceManyBody())
    .force('center', d3.forceCenter(width / 2, height / 2));

  //draw links
  let maxWeight = 0;
  links.forEach((l) => {
    maxWeight = Math.max(maxWeight, l.value);
  });
  const scaleLine = d3.scaleSqrt().domain([0, maxWeight]).range([0, 6]);
  const link = svg
    .append('g')
    .attr('class', 'links')
    .selectAll('line')
    .data(links)
    .enter()
    .append('line')
    .attr('stroke-width', (d) => scaleLine(d.value))
    .attr('stroke', '#cecece');

  const node = svg
    .append('g')
    .attr('class', 'nodes')
    .selectAll('g')
    .data(nodes)
    .enter()
    .append('g');

  let maxNoOfEdges = 0;
  nodes.forEach((node) => {
    const noOfEdges = getNoOfEdgesForNode(node, edges);
    maxNoOfEdges = Math.max(maxNoOfEdges, noOfEdges);
  });

  const dragStarted = (d: any) => {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
    console.log('started..');
  };

  const dragged = (d: any) => {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
  };

  const dragEnded = (d: any) => {
    if (!d3.event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
    console.log('ended..');
  };

  //draw nodes
  const scaleCircles = d3
    .scaleSqrt() // instead of scaleLinear()
    .domain([0, maxNoOfEdges])
    .range([0, 20]);

  const circles = node
    .append('circle')
    .attr('r', (d) => scaleCircles(getNoOfEdgesForNode(d, edges)))
    .attr('fill', function (d) {
      return '#59ba88';
    })
    .call(
      d3
        .drag()
        .on('start', dragStarted)
        .on('drag', dragged)
        .on('end', dragEnded)
    );

  //draw node labels
  const lables = node
    .append('text')
    .text(function (d) {
      return d.children[0].innerHTML;
    })
    .attr('x', 6)
    .attr('y', 3);

  (<any>simulation.force('link')).links(links);

  //set x and y for links
  const ticked = () => {
    link
      .attr('x1', function (d: any) {
        return d.source.x;
      })
      .attr('y1', function (d: any) {
        return d.source.y;
      })
      .attr('x2', function (d: any) {
        return d.target.x;
      })
      .attr('y2', function (d: any) {
        return d.target.y;
      });

    node.attr('transform', function (d: any) {
      return 'translate(' + d.x + ',' + d.y + ')';
    });
  };

  simulation.nodes(<any>nodes).on('tick', ticked);

  //search
  console.log(d3.select('#search').node());
  d3.select('#search').on('change textInput input', () => {
    const searchString = d3.event.target.value;
    circles.attr('fill', (d) => {
      const includesSearchString = d.children[0].innerHTML
        .toLowerCase()
        .includes(searchString);
      return includesSearchString ? '#59ba88' : '#dddddd';
    });
  });

  //zoom
  let moveFactor = 1.6;
  const handleZoom = () => {
    const event = <WheelEvent>d3.event;
    const scale = 1 + event.deltaY * 0.001;
    moveFactor += moveFactor * event.deltaY * 0.001;
    const height = chart.viewBox.animVal.height * scale;
    const width = chart.viewBox.animVal.width * scale;
    const viewboxX =
      chart.viewBox.animVal.x - (height - chart.viewBox.animVal.height) / 2;
    const viewboxY =
      chart.viewBox.animVal.y - (width - chart.viewBox.animVal.width) / 2;

    chart.setAttribute('viewBox', `${viewboxX} ${viewboxY} ${height} ${width}`);
  };

  d3.select(window).on('wheel', handleZoom);

  //position change
  let spaceKeyDown = false;
  const handleSpaceKeyDown = () => {
    if (!spaceKeyDown && d3.event.keyCode === 32) {
      spaceKeyDown = true;
      document.body.style.cursor = 'move';
    }
  };

  const handleSpaceKeyUp = () => {
    if (spaceKeyDown && d3.event.keyCode === 32) {
      spaceKeyDown = false;
      document.body.style.cursor = 'auto';
    }
  };

  let isAdjustingPosition = false;
  let x = 0;
  let y = 0;

  const handleMouseDown = () => {
    const e = <MouseEvent>d3.event;
    e.preventDefault();
    x = e.offsetX;
    y = e.offsetY;
    isAdjustingPosition = true;
  };

  const handleMouseUp = () => {
    const e = <MouseEvent>d3.event;
    e.preventDefault();
    x = 0;
    y = 0;
    isAdjustingPosition = false;
  };

  const handlePositionChange = () => {
    const e = <MouseEvent>d3.event;
    e.preventDefault();
    if (spaceKeyDown && isAdjustingPosition) {
      const viewboxX = chart.viewBox.animVal.x + (x - e.offsetX) * moveFactor;
      const viewboxY = chart.viewBox.animVal.y + (y - e.offsetY) * moveFactor;
      const height = chart.viewBox.animVal.height;
      const width = chart.viewBox.animVal.width;
      chart.setAttribute(
        'viewBox',
        `${viewboxX} ${viewboxY} ${height} ${width}`
      );
      x = e.offsetX;
      y = e.offsetY;
    }
  };

  d3.select(window).on('keydown', handleSpaceKeyDown);
  d3.select(window).on('keyup', handleSpaceKeyUp);
  d3.select(window).on('mousedown', handleMouseDown);
  d3.select(window).on('mouseup', handleMouseUp);
  d3.select(window).on('mousemove', handlePositionChange);

  //set initial size
  resizeChart();
};
