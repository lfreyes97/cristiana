import { visit } from 'unist-util-visit';

/**
 * Plugin rehype para limpiar namespaces h5: de SVGs generados por Typst
 * Se ejecuta DESPUÉS de rehype-typst
 */
export function rehypeCleanTypstNamespace() {
  return (tree) => {
    visit(tree, 'element', (node) => {
      // Si es un SVG con clase typst-doc
      if (node.tagName === 'svg' && node.properties?.className?.includes('typst-doc')) {
        // Procesar recursivamente para encontrar foreignObject
        visitForeignObjects(node);
      }
    });
  };
}

function visitForeignObjects(node) {
  if (!node.children) return;

  node.children.forEach((child) => {
    if (child.tagName === 'foreignObject') {
      // Procesar los hijos del foreignObject
      cleanForeignObjectContent(child);
    }
    // Recurse
    if (child.children) {
      visitForeignObjects(child);
    }
  });
}

function cleanForeignObjectContent(node) {
  if (!node.children) return;

  node.children.forEach((child, idx) => {
    // Si es h5:div, convertir a div
    if (child.tagName === 'h5:div') {
      child.tagName = 'div';
    }
    
    // Remover propiedades xmlns:h5
    if (child.properties) {
      delete child.properties['xmlns:h5'];
    }

    // Recurse
    if (child.children) {
      cleanForeignObjectContent(child);
    }
  });
}
