DEBUG = True
DEFAULT_DECORATOR = "---------------------------------------"


def d_print(output='', end='\n'):
    if not DEBUG:
        return
    else:
        print(output, end=end)


class Printer(object):
    """docstring for Printer."""

    def __init__(self, inPlace=False, printFunction=d_print):
        super(Printer, self).__init__()
        self.isInPlace = inPlace
        self.print_func = printFunction
        self.needsReset = True

    def log(self, output):
        if (self.isInPlace and not self.needsReset):
            self.print_func('\r', '')
        if (self.needsReset):
            self.print_func()
            self.needsReset = False
        self.print_func(output, '' if self.isInPlace else '\n')

    def reset(self):
        self.needsReset = True


class DividerPrinter(Printer):
    """docstring for DividerPrinter."""

    def __init__(self, decorator=DEFAULT_DECORATOR, printFunction=d_print):
        super().__init__(False, printFunction)
        self.decorator = decorator

    def log(self, output):
        super().log('{0}{1}{0}'.format(self.decorator, output))
