class _DateUtils {
    format(timestamp: Date): string {
        var year = timestamp.getFullYear();
        var month = timestamp.getMonth() + 1;
        var day = timestamp.getDate();
        var hours = timestamp.getHours();
        var minutes = timestamp.getMinutes();
        var seconds = timestamp.getSeconds();
        return year + "-" + month + "-" + day + "%20"
            + hours + "%3A" + minutes + "%3A" + seconds;
    };
}

const DateUtils = new _DateUtils();

export default DateUtils;
