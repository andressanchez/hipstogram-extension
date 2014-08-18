/**
 * Some useful functions
 *
 * timeToSeconds - Convert time in format "mm:ss" to seconds
 * String.prototype.contains - Add contains to String
 *
 */

function timeToSeconds(time)
{
    var a = time.split(':');
    var seconds = (+a[0]) * 60 + (+a[1]);
    return seconds;
}

if (!String.prototype.contains) {
    String.prototype.contains = function(s, i) {
        return this.indexOf(s, i) != -1;
    }
}
