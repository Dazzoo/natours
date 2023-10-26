module.exports = (obj, ...fields) => {
    const filteredObj = {}

    for (let field of fields) {
        if (obj.hasOwnProperty(field)) {
            filteredObj[field] = obj[field]
        }
    }
    return filteredObj
}
