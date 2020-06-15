import { icons } from 'feather-icons';
import { customElement, LitElement, property } from 'lit-element';

@customElement('feather-icon')
class FeatherIcon extends LitElement {
    @property()
    name = '';

    @property()
    className = '';

    @property()
    strokeWidth = 2;

    @property()
    size = 20;

    svgElement: SVGElement;

    constructor() {
        super();
    }

    connectedCallback() {
        super.connectedCallback();
        if (this.name in icons) {
            const svgDocument = new DOMParser().parseFromString(
                icons[this.name].toSvg({
                    'stroke-width': this.strokeWidth,
                    height: this.size,
                    width: this.size,
                    ...{ class: this.className },
                }),
                'image/svg+xml'
            );
            this.svgElement = svgDocument.querySelector('svg');
        }
    }

    render() {
        return this.svgElement;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'feather-icon': FeatherIcon;
    }
}
