export interface GraphMlNode {
    id: string;    
    children: GraphMlData[];
}

export interface GraphMlEdge {
    attributes: {
        source: {
            nodeValue: string;
        }
        target: {
            nodeValue: string;
        } 
    } 
    children: GraphMlData[]
}

interface GraphMlData {
    innerHTML: string;
}