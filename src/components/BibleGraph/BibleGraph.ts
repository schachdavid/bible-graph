import * as d3 from 'd3';
import { css, customElement, html, LitElement, property } from 'lit-element';
import { CarData, ChartData, GroupedDataEntry } from '../../data';
import { GraphMlEdge, GraphMlNode } from '../../util/graphMlTypes';

@customElement('bible-graph')
class BibleGraph extends LitElement {
  @property({ attribute: false })
  carData: CarData[];

  @property({ attribute: false })
  chartData: ChartData[];

  @property({ attribute: false })
  groupedData: GroupedDataEntry[];

  @property({ attribute: false })
  color: (id: string) => string;

  static get styles() {
    return css``;
  }

  constructor() {
    super();
  }

  updated() {
    this.renderChart();
  }

  cleanChart() {
    d3.select(this.shadowRoot.children[0]).selectAll('*').remove();
  }

  getNoOfEdgesForNode = (node: GraphMlNode, edges: GraphMlEdge[]) => {
    return edges.filter(
      (e) =>
        e.attributes.source.nodeValue === node.id ||
        e.attributes.target.nodeValue === node.id
    ).length;
  };
  async renderChart() {
    // set the dimensions and margins of the graph
    const margin = { top: 10, right: 30, bottom: 10, left: 30 };
    const width = 700 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    const container = this.shadowRoot.children[0];
    console.log(container.children[0]);
    
    const chart = <SVGSVGElement>container.children[0];
    console.log(typeof chart);
    
    const aspect = chart.width.baseVal.value / chart.height.baseVal.value;

    d3.select(window).on('resize', function () {
      console.log(chart.width.baseVal.value);

      var targetWidth = chart.getBoundingClientRect().width;
      console.log("targetwidth: ", targetWidth);
      chart.setAttribute('width', targetWidth.toString())
      chart.setAttribute('height', (targetWidth / aspect).toString())

    //   chart.attr('width', targetWidth);
    //   chart.attr('height', targetWidth / aspect);
    });

    // append the svg object to the body of the page
    const svg = d3
      .select(this.shadowRoot.children[0].children[0])
      .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    const color = d3.scaleOrdinal(d3.schemeCategory10);

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

    const root: any = nodes[0];

    console.log(nodes);
    console.log(links);
    console.log(root);

    const link = svg
      .append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('stroke-width', (d) => Math.sqrt(d.value));

    const node = svg
      .append('g')
      .attr('class', 'nodes')
      .selectAll('g')
      .data(nodes)
      .enter()
      .append('g');

    let maxNoOfEdges = 0;
    nodes.forEach((node) => {
      const noOfEdges = this.getNoOfEdgesForNode(node, edges);
      maxNoOfEdges = Math.max(maxNoOfEdges, noOfEdges);
    });

    const scaleCircles = d3
      .scaleSqrt() // instead of scaleLinear()
      .domain([0, maxNoOfEdges])
      .range([0, 20]);

    const circles = node
      .append('circle')
      .attr('r', (d) => scaleCircles(this.getNoOfEdgesForNode(d, edges)))
      .attr('fill', function (d) {
        return '#59ba88';
      })
      .call(
        d3
          .drag()
          .on('start', dragstarted)
          .on('drag', dragged)
          .on('end', dragended)
      );

    const lables = node
      .append('text')
      .text(function (d) {
        return d.children[0].innerHTML;
      })
      .attr('x', 6)
      .attr('y', 3);

    simulation.nodes(<any>nodes).on('tick', ticked);

    (<any>simulation.force('link')).links(links);

    function ticked() {
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
    }

    function dragstarted(d: any) {
      if (!d3.event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(d: any) {
      d.fx = d3.event.x;
      d.fy = d3.event.y;
    }

    function dragended(d: any) {
      if (!d3.event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }
  }

  render() {
    return html`<div id="container">
    <svg id="chart" width="600" height="200"
      viewBox="0 0 600 200"
      perserveAspectRatio="xMinYMid">
    </svg>
  </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'bible-graph': BibleGraph;
  }
}
