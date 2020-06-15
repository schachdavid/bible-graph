import * as d3 from 'd3';
import { ChartData } from '../data';

/**
 * Creates a scaler for the given category.
 * The scaler scales the values from 0 to 1 where 1 is the max value for the given category.
 *
 * @param data
 * @param category
 */
export const scalerFactory = (data: ChartData[], category: string) => {
    const max = d3.max(
        data.filter((d) => d.category === category),
        (d: ChartData) => {
            return +d.value;
        }
    );
    return d3.scaleLinear().domain([0, max]).range([0, 1]);
};
