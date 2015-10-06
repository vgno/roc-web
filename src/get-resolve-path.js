import path from 'path';

/* Returns a path in which the roc application can look for dependencies
 * Need to be extended when extending this egg.
 */
export default function() {
    return path.join(__dirname, '..', 'node_modules');
}
