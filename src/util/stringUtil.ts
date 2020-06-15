
/**
 *  Starts each word of a string with a capital letter.
 *  If the word is shorter or equal 3 letters its probably an acronyme and all letters will be capitalized.
 *
 * @param string
 */
export const capitalize = (string: string) => {
    let str = string.split(' ');
    for (let i = 0, x = str.length; i < x; i++) {
        //if shorten or eqal 3 letters its probably an acronyme -> all upper case
        if (str[i].length <= 3) str[i] = str[i].toUpperCase();
        else str[i] = str[i][0].toUpperCase() + str[i].substr(1);
    }
    return str.join(' ');
};
